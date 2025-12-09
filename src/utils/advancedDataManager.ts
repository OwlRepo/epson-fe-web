/**
 * Advanced Data Manager - Multi-tier storage for 500k records
 * Handles hot (RAM), warm (IndexedDB), and cold (compressed chunks) storage
 * with automatic cleanup at 500k threshold
 */

import {
  compressChunk,
  decompressChunk,
  buildSearchText,
  buildChunkSearchIndex,
  chunkMatchesQuery,
} from "./compression";

// Types
export interface Record {
  ID: string | number;
  [key: string]: any;
}

export interface FilterConfig {
  [key: string]: any;
}

export interface TierStats {
  hot: number;
  warm: number;
  cold: number;
  total: number;
}

export interface ChunkData {
  chunkId: number;
  data: string; // Compressed
  recordCount: number;
  startTimestamp: number;
  endTimestamp: number;
  searchIndex: string[];
}

// Configuration constants
const DB_NAME = "HeavyDataDB";
const DB_VERSION = 1;
const STORE_WARM = "warm";
const STORE_COLD = "cold";
const STORE_META = "meta";

export class AdvancedDataManager {
  // Tier limits
  private readonly HOT_LIMIT = 1000;
  private readonly WARM_LIMIT = 10000;
  private readonly COLD_LIMIT = 489000;
  private readonly MAX_TOTAL = 500000;
  private readonly CHUNK_SIZE = 10000;

  // Storage
  private hotCache: Record[] = [];
  private db: IDBDatabase | null = null;
  private searchIndex: Map<string, number[]> = new Map();
  private isInitialized = false;

  /**
   * Initialize IndexedDB and optionally load hot cache
   * @param lazyLoad If true, only load hot cache; if false, load all metadata
   */
  async init(lazyLoad = true): Promise<void> {
    if (this.isInitialized) return;

    // Open IndexedDB
    this.db = await this.openDatabase();

    if (lazyLoad) {
      // Fast initialization: load only hot cache
      await this.loadHotCache();
    } else {
      // Full initialization: load hot cache and metadata
      await this.loadHotCache();
      await this.buildSearchIndex();
    }

    this.isInitialized = true;
  }

  /**
   * Open IndexedDB database
   */
  private async openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Warm store
        if (!db.objectStoreNames.contains(STORE_WARM)) {
          const warmStore = db.createObjectStore(STORE_WARM, { keyPath: "ID" });
          warmStore.createIndex("timestamp", "timestamp", { unique: false });
          warmStore.createIndex("Status", "Status", { unique: false });
          warmStore.createIndex("Purpose", "Purpose", { unique: false });
          warmStore.createIndex("searchText", "searchText", { unique: false });
        }

        // Cold store (chunked)
        if (!db.objectStoreNames.contains(STORE_COLD)) {
          const coldStore = db.createObjectStore(STORE_COLD, {
            keyPath: "chunkId",
          });
          coldStore.createIndex("startTimestamp", "startTimestamp", {
            unique: false,
          });
          coldStore.createIndex("endTimestamp", "endTimestamp", {
            unique: false,
          });
        }

        // Metadata store
        if (!db.objectStoreNames.contains(STORE_META)) {
          db.createObjectStore(STORE_META, { keyPath: "key" });
        }
      };
    });
  }

  /**
   * Load hot cache from warm store
   */
  private async loadHotCache(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    const tx = this.db.transaction(STORE_WARM, "readonly");
    const store = tx.objectStore("warm");
    const index = store.index("timestamp");

    // Get most recent records
    const request = index.openCursor(null, "prev");

    return new Promise((resolve, reject) => {
      const records: Record[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && records.length < this.HOT_LIMIT) {
          records.push(cursor.value);
          cursor.continue();
        } else {
          this.hotCache = records;
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Build search index from hot cache
   */
  private async buildSearchIndex(): Promise<void> {
    this.searchIndex.clear();
    this.hotCache.forEach((record, index) => {
      const searchText = buildSearchText(record);
      const words = searchText.split(/\s+/);
      words.forEach((word) => {
        if (!this.searchIndex.has(word)) {
          this.searchIndex.set(word, []);
        }
        this.searchIndex.get(word)!.push(index);
      });
    });
  }

  /**
   * Add new record from socket
   * Triggers cascade and auto-cleanup if needed
   */
  async addRecord(record: Record): Promise<void> {
    if (!this.isInitialized) await this.init();

    // Add timestamp if not present
    if (!record.timestamp) {
      record.timestamp = Date.now();
    }

    // Add searchable text
    record.searchText = buildSearchText(record);

    // Add to front of hot cache
    this.hotCache.unshift(record);

    // Update search index
    this.updateSearchIndex(record, 0);

    // Cascade if hot cache exceeds limit
    if (this.hotCache.length > this.HOT_LIMIT) {
      await this.cascadeToWarm();
    }

    // Check total count and cleanup if needed
    const stats = await this.getStats();
    if (stats.total > this.MAX_TOTAL) {
      await this.cleanupOldest();
    }
  }

  /**
   * Update search index with new record
   */
  private updateSearchIndex(record: Record, index: number): void {
    const searchText = buildSearchText(record);
    const words = searchText.split(/\s+/);
    words.forEach((word) => {
      if (!this.searchIndex.has(word)) {
        this.searchIndex.set(word, []);
      }
      this.searchIndex.get(word)!.push(index);
    });
  }

  /**
   * Cascade overflow from hot to warm tier
   */
  private async cascadeToWarm(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    // Take records beyond HOT_LIMIT
    const overflow = this.hotCache.splice(this.HOT_LIMIT);

    if (overflow.length === 0) return;

    // Add to warm store
    const tx = this.db.transaction(STORE_WARM, "readwrite");
    const store = tx.objectStore(STORE_WARM);

    overflow.forEach((record) => {
      store.add(record);
    });

    await this.waitForTransaction(tx);

    // Check if warm store needs cascade
    const warmCount = await this.getWarmCount();
    if (warmCount > this.WARM_LIMIT) {
      await this.cascadeToCold();
    }
  }

  /**
   * Cascade overflow from warm to cold tier
   */
  private async cascadeToCold(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    // Get oldest records from warm store
    const tx = this.db.transaction([STORE_WARM, STORE_COLD], "readwrite");
    const warmStore = tx.objectStore(STORE_WARM);
    const coldStore = tx.objectStore(STORE_COLD);
    const index = warmStore.index("timestamp");

    const warmCount = await this.getWarmCount();
    const overflow = warmCount - this.WARM_LIMIT;

    if (overflow <= 0) return;

    // Get oldest records to move
    const recordsToMove: Record[] = [];
    const request = index.openCursor(null, "next");

    await new Promise<void>((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && recordsToMove.length < this.CHUNK_SIZE) {
          recordsToMove.push(cursor.value);
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });

    if (recordsToMove.length === 0) return;

    // Get next chunk ID
    const chunkId = await this.getNextChunkId();

    // Compress and save chunk
    const compressedData = compressChunk(recordsToMove);
    const searchIndex = buildChunkSearchIndex(recordsToMove);

    const chunkData: ChunkData = {
      chunkId,
      data: compressedData,
      recordCount: recordsToMove.length,
      startTimestamp: recordsToMove[0].timestamp,
      endTimestamp: recordsToMove[recordsToMove.length - 1].timestamp,
      searchIndex,
    };

    coldStore.add(chunkData);

    // Delete moved records from warm store
    recordsToMove.forEach((record) => {
      warmStore.delete(record.ID);
    });

    await this.waitForTransaction(tx);
  }

  /**
   * Cleanup oldest records when exceeding MAX_TOTAL
   */
  private async cleanupOldest(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    const stats = await this.getStats();
    const excess = stats.total - this.MAX_TOTAL;

    if (excess <= 0) return;

    console.log(`Auto-cleanup: Removing ${excess} oldest records`);

    // Delete oldest chunks from cold store
    const tx = this.db.transaction(STORE_COLD, "readwrite");
    const store = tx.objectStore(STORE_COLD);
    const index = store.index("startTimestamp");

    let deletedCount = 0;
    const request = index.openCursor(null, "next");

    await new Promise<void>((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && deletedCount < excess) {
          const chunk = cursor.value as ChunkData;
          cursor.delete();
          deletedCount += chunk.recordCount;
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });

    await this.waitForTransaction(tx);

    console.log(`Auto-cleanup complete: Removed ${deletedCount} records`);
  }

  /**
   * Get next available chunk ID
   */
  private async getNextChunkId(): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");

    const tx = this.db.transaction(STORE_COLD, "readonly");
    const store = tx.objectStore(STORE_COLD);

    return new Promise((resolve, reject) => {
      const request = store.openCursor(null, "prev");

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          resolve((cursor.value as ChunkData).chunkId + 1);
        } else {
          resolve(0);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get warm store count
   */
  private async getWarmCount(): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");

    const tx = this.db.transaction(STORE_WARM, "readonly");
    const store = tx.objectStore(STORE_WARM);

    return new Promise((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cold store count
   */
  private async getColdCount(): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");

    const tx = this.db.transaction(STORE_COLD, "readonly");
    const store = tx.objectStore(STORE_COLD);

    let totalRecords = 0;

    return new Promise((resolve, reject) => {
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          totalRecords += (cursor.value as ChunkData).recordCount;
          cursor.continue();
        } else {
          resolve(totalRecords);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get statistics about all tiers
   */
  async getStats(): Promise<TierStats> {
    const hot = this.hotCache.length;
    const warm = await this.getWarmCount();
    const cold = await this.getColdCount();

    return {
      hot,
      warm,
      cold,
      total: hot + warm + cold,
    };
  }

  /**
   * Load page of records for infinite scroll
   */
  async loadPage(offset: number, limit: number): Promise<Record[]> {
    if (!this.isInitialized) await this.init();

    const results: Record[] = [];

    // Load from hot cache
    if (offset < this.hotCache.length) {
      const hotRecords = this.hotCache.slice(offset, offset + limit);
      results.push(...hotRecords);
      if (results.length >= limit) {
        return results.slice(0, limit);
      }
    }

    // Load from warm store
    const remainingLimit = limit - results.length;
    const warmOffset = Math.max(0, offset - this.hotCache.length);
    const warmRecords = await this.loadFromWarm(warmOffset, remainingLimit);
    results.push(...warmRecords);

    if (results.length >= limit) {
      return results.slice(0, limit);
    }

    // Load from cold store if needed
    const coldOffset = Math.max(
      0,
      offset - this.hotCache.length - (await this.getWarmCount())
    );
    const coldLimit = limit - results.length;
    const coldRecords = await this.loadFromCold(coldOffset, coldLimit);
    results.push(...coldRecords);

    return results.slice(0, limit);
  }

  /**
   * Load records from warm store
   */
  private async loadFromWarm(offset: number, limit: number): Promise<Record[]> {
    if (!this.db) return [];

    const tx = this.db.transaction(STORE_WARM, "readonly");
    const store = tx.objectStore(STORE_WARM);
    const index = store.index("timestamp");

    const results: Record[] = [];
    let skipped = 0;

    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, "prev");

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          if (skipped < offset) {
            skipped++;
            cursor.continue();
          } else if (results.length < limit) {
            results.push(cursor.value);
            cursor.continue();
          } else {
            resolve(results);
          }
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Load records from cold store
   */
  private async loadFromCold(offset: number, limit: number): Promise<Record[]> {
    if (!this.db) return [];

    const tx = this.db.transaction(STORE_COLD, "readonly");
    const store = tx.objectStore(STORE_COLD);
    const index = store.index("startTimestamp");

    const results: Record[] = [];
    let recordsSkipped = 0;

    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, "prev");

      request.onsuccess = async (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const chunk = cursor.value as ChunkData;
          const chunkRecords = decompressChunk<Record>(chunk.data);

          for (const record of chunkRecords) {
            if (recordsSkipped < offset) {
              recordsSkipped++;
              continue;
            }
            if (results.length < limit) {
              results.push(record);
            } else {
              resolve(results);
              return;
            }
          }

          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Search across all tiers
   */
  async search(query: string, limit = 100): Promise<Record[]> {
    if (!this.isInitialized) await this.init();
    if (!query.trim()) return [];

    const lowerQuery = query?.toLowerCase();
    const results: Record[] = [];

    // Search hot cache
    const hotResults = this.hotCache.filter((record) =>
      record.searchText?.includes(lowerQuery)
    );
    results.push(...hotResults);

    if (results.length >= limit) {
      return results.slice(0, limit);
    }

    // Search warm store
    const warmResults = await this.searchWarm(
      lowerQuery,
      limit - results.length
    );
    results.push(...warmResults);

    if (results.length >= limit) {
      return results.slice(0, limit);
    }

    // Search cold store
    const coldResults = await this.searchCold(
      lowerQuery,
      limit - results.length
    );
    results.push(...coldResults);

    return results.slice(0, limit);
  }

  /**
   * Search warm store
   */
  private async searchWarm(query: string, limit: number): Promise<Record[]> {
    if (!this.db) return [];

    const tx = this.db.transaction(STORE_WARM, "readonly");
    const store = tx.objectStore(STORE_WARM);

    const results: Record[] = [];

    return new Promise((resolve, reject) => {
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const record = cursor.value as Record;
          if (record.searchText?.includes(query)) {
            results.push(record);
          }
          if (results.length < limit) {
            cursor.continue();
          } else {
            resolve(results);
          }
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Search cold store using chunk indices
   */
  private async searchCold(query: string, limit: number): Promise<Record[]> {
    if (!this.db) return [];

    const tx = this.db.transaction(STORE_COLD, "readonly");
    const store = tx.objectStore(STORE_COLD);

    const results: Record[] = [];

    return new Promise((resolve, reject) => {
      const request = store.openCursor();

      request.onsuccess = async (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const chunk = cursor.value as ChunkData;

          // Check if chunk might contain matching records
          if (chunkMatchesQuery(chunk.searchIndex, query)) {
            const chunkRecords = decompressChunk<Record>(chunk.data);
            const matchingRecords = chunkRecords.filter((record) =>
              record.searchText?.includes(query)
            );
            results.push(...matchingRecords);
          }

          if (results.length < limit) {
            cursor.continue();
          } else {
            resolve(results.slice(0, limit));
          }
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Filter records across all tiers
   */
  async filter(filters: FilterConfig): Promise<Record[]> {
    if (!this.isInitialized) await this.init();

    const results: Record[] = [];

    // Filter hot cache
    const hotResults = this.hotCache.filter((record) =>
      this.matchesFilter(record, filters)
    );
    results.push(...hotResults);

    // Filter warm and cold stores
    const warmResults = await this.filterWarm(filters);
    results.push(...warmResults);

    const coldResults = await this.filterCold(filters);
    results.push(...coldResults);

    return results;
  }

  /**
   * Check if record matches filter
   */
  private matchesFilter(record: Record, filters: FilterConfig): boolean {
    return Object.entries(filters).every(([key, value]) => {
      if (value === null || value === undefined || value === "") return true;
      return record[key] === value;
    });
  }

  /**
   * Filter warm store
   */
  private async filterWarm(filters: FilterConfig): Promise<Record[]> {
    if (!this.db) return [];

    const tx = this.db.transaction(STORE_WARM, "readonly");
    const store = tx.objectStore(STORE_WARM);

    const results: Record[] = [];

    return new Promise((resolve, reject) => {
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const record = cursor.value as Record;
          if (this.matchesFilter(record, filters)) {
            results.push(record);
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Filter cold store
   */
  private async filterCold(filters: FilterConfig): Promise<Record[]> {
    if (!this.db) return [];

    const tx = this.db.transaction(STORE_COLD, "readonly");
    const store = tx.objectStore(STORE_COLD);

    const results: Record[] = [];

    return new Promise((resolve, reject) => {
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const chunk = cursor.value as ChunkData;
          const chunkRecords = decompressChunk<Record>(chunk.data);
          const matchingRecords = chunkRecords.filter((record) =>
            this.matchesFilter(record, filters)
          );
          results.push(...matchingRecords);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Combined search and filter
   */
  async searchAndFilter(
    query: string,
    filters: FilterConfig
  ): Promise<Record[]> {
    const searchResults = await this.search(query, 1000);
    return searchResults.filter((record) =>
      this.matchesFilter(record, filters)
    );
  }

  /**
   * Wait for transaction to complete
   */
  private waitForTransaction(tx: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Clear all data (for testing/debugging)
   */
  async clear(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    this.hotCache = [];
    this.searchIndex.clear();

    const tx = this.db.transaction(
      [STORE_WARM, STORE_COLD, STORE_META],
      "readwrite"
    );

    tx.objectStore(STORE_WARM).clear();
    tx.objectStore(STORE_COLD).clear();
    tx.objectStore(STORE_META).clear();

    await this.waitForTransaction(tx);
  }
}

// Export singleton instance
export const dataManager = new AdvancedDataManager();
