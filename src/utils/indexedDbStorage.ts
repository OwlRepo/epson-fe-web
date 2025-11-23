/**
 * IndexedDB Storage Utility for Large Socket Data
 * Handles storing, retrieving, updating, and searching large datasets (200k+ records)
 */

const DB_NAME = "epson-socket-data";
const DB_VERSION = 1;

// Common fields to index for fast queries
const COMMON_INDEXES = [
  "id",
  "employee_id",
  "employee_no",
  "ID",
  "date_receive",
  "date_time",
  "log_time",
  "name",
  "full_name",
  "Name",
  "section",
  "department",
  "division",
  "controller_type",
  "device_name",
  "epc",
  "tag_id",
];

interface IndexedDbStorage {
  db: IDBDatabase | null;
  initPromise: Promise<IDBDatabase> | null;
  pendingStores: Set<string>; // Track stores that need to be created
  ensureStorePromises: Map<string, Promise<void>>; // Track ongoing ensure operations
  currentVersion: number | null; // Track current database version
}

const storage: IndexedDbStorage = {
  db: null,
  initPromise: null,
  pendingStores: new Set(),
  ensureStorePromises: new Map(),
  currentVersion: null,
};

/**
 * Get current database version without opening
 */
async function getCurrentVersion(): Promise<number> {
  if (storage.currentVersion !== null) {
    return storage.currentVersion;
  }

  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME);
    request.onsuccess = () => {
      storage.currentVersion = request.result.version;
      request.result.close();
      resolve(storage.currentVersion);
    };
    request.onerror = () => {
      // If can't open, use default version
      storage.currentVersion = DB_VERSION;
      resolve(DB_VERSION);
    };
    request.onblocked = () => {
      storage.currentVersion = DB_VERSION;
      resolve(DB_VERSION);
    };
  });
}

/**
 * Initialize IndexedDB database and object stores
 */
async function initDatabase(): Promise<IDBDatabase> {
  if (storage.db) {
    return Promise.resolve(storage.db);
  }

  if (storage.initPromise) {
    return storage.initPromise;
  }

  // Get current version first
  const version = await getCurrentVersion();

  storage.initPromise = new Promise((resolve, reject) => {
    // Open with current version (or higher if upgrading)
    const request = indexedDB.open(DB_NAME, version);

    request.onerror = () => {
      console.error("❌ IndexedDB open error:", request.error);
      storage.initPromise = null;
      reject(request.error);
    };

    request.onsuccess = () => {
      storage.db = request.result;
      storage.currentVersion = storage.db.version;
      console.log(
        `✅ IndexedDB initialized successfully (version ${storage.db.version})`
      );
      resolve(storage.db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      storage.currentVersion = db.version;
      console.log(`🔄 IndexedDB upgrade needed to version ${db.version}`);

      // Note: Object stores will be created on-demand via ensureObjectStore
      // This handler is here for future schema changes
    };
  });

  return storage.initPromise;
}

/**
 * Ensure object store exists for a room (creates if needed via version upgrade)
 */
async function ensureObjectStore(room: string): Promise<void> {
  // Check if we're already ensuring this store
  if (storage.ensureStorePromises.has(room)) {
    return storage.ensureStorePromises.get(room)!;
  }

  // Check if store already exists
  const db = await initDatabase();
  if (db.objectStoreNames.contains(room)) {
    return;
  }

  // Store needs to be created - create promise and track it
  const ensurePromise = (async () => {
    storage.pendingStores.add(room);

    // Close current connection
    if (storage.db) {
      storage.db.close();
      storage.db = null;
      storage.initPromise = null;
    }

    // Get current version
    const currentVersion = await getCurrentVersion();
    const newVersion = currentVersion + 1;

    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, newVersion);

      request.onerror = () => {
        console.error("❌ IndexedDB upgrade error:", request.error);
        storage.ensureStorePromises.delete(room);
        reject(request.error);
      };

      request.onsuccess = () => {
        storage.db = request.result;
        storage.currentVersion = storage.db.version;
        storage.initPromise = Promise.resolve(storage.db);
        console.log(
          `✅ IndexedDB upgraded to version ${newVersion}, created store for room: ${room}`
        );
        storage.ensureStorePromises.delete(room);
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log(`🔄 Creating object store for room: ${room}`);

        // Create object store for this room
        if (!db.objectStoreNames.contains(room)) {
          const objectStore = db.createObjectStore(room, {
            keyPath: "id",
            autoIncrement: false,
          });

          // Create indexes on common fields
          COMMON_INDEXES.forEach((field) => {
            try {
              objectStore.createIndex(field, field, { unique: false });
            } catch (err) {
              console.warn(`⚠️ Could not create index on ${field}:`, err);
            }
          });

          // Create a composite index for date_receive sorting (most important)
          try {
            objectStore.createIndex("date_receive_idx", "date_receive", {
              unique: false,
            });
          } catch (err) {
            console.warn("⚠️ Could not create date_receive index:", err);
          }
        }

        // Also create any other pending stores
        storage.pendingStores.forEach((pendingRoom) => {
          if (
            pendingRoom !== room &&
            !db.objectStoreNames.contains(pendingRoom)
          ) {
            try {
              const pendingStore = db.createObjectStore(pendingRoom, {
                keyPath: "id",
                autoIncrement: false,
              });
              COMMON_INDEXES.forEach((field) => {
                try {
                  pendingStore.createIndex(field, field, { unique: false });
                } catch (err) {
                  console.warn(`⚠️ Could not create index on ${field}:`, err);
                }
              });
              try {
                pendingStore.createIndex("date_receive_idx", "date_receive", {
                  unique: false,
                });
              } catch (err) {
                console.warn("⚠️ Could not create date_receive index:", err);
              }
            } catch (err) {
              console.warn(
                `⚠️ Could not create store for ${pendingRoom}:`,
                err
              );
            }
          }
        });

        storage.pendingStores.clear();
      };
    });
  })();

  storage.ensureStorePromises.set(room, ensurePromise);
  return ensurePromise;
}

/**
 * Get or create object store for a specific room
 */
async function getObjectStore(
  room: string,
  mode: IDBTransactionMode = "readwrite"
): Promise<IDBObjectStore> {
  // Ensure the object store exists first
  await ensureObjectStore(room);

  const db = await initDatabase();

  if (!db.objectStoreNames.contains(room)) {
    throw new Error(`Failed to create object store for room: ${room}`);
  }

  const transaction = db.transaction([room], mode);
  return transaction.objectStore(room);
}

/**
 * Generate a unique ID for a record
 */
function generateRecordId(record: any): string {
  // Try to use existing id fields
  if (record.id) return String(record.id);
  if (record.ID) return String(record.ID);
  if (record.employee_id && record.clocked_in) {
    return `${record.employee_id}_${record.clocked_in}`;
  }
  if (record.employee_id && record.date_receive) {
    return `${record.employee_id}_${record.date_receive}`;
  }
  // Fallback: generate from multiple fields
  const key = `${record.employee_id || record.ID || ""}_${
    record.date_receive || record.date_time || record.log_time || Date.now()
  }`;
  return key || `record_${Date.now()}_${Math.random()}`;
}

/**
 * Store preload data (200k+ records) in IndexedDB
 */
export async function storePreloadData(
  room: string,
  data: any[]
): Promise<void> {
  if (!data || data.length === 0) {
    console.log(`📦 [IndexedDB] No data to store for room: ${room}`);
    return;
  }

  console.log(
    `📦 [IndexedDB] Storing ${data.length} records for room: ${room}`
  );

  const startTime = performance.now();
  const objectStore = await getObjectStore(room, "readwrite");

  // Clear existing data first
  await new Promise<void>((resolve, reject) => {
    const clearRequest = objectStore.clear();
    clearRequest.onsuccess = () => resolve();
    clearRequest.onerror = () => reject(clearRequest.error);
  });

  // Batch insert records
  const batchSize = 1000;
  let processed = 0;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const transaction = (await initDatabase()).transaction([room], "readwrite");
    const store = transaction.objectStore(room);

    await Promise.all(
      batch.map((record) => {
        return new Promise<void>((resolve, reject) => {
          // Ensure record has an id
          const recordWithId = {
            ...record,
            id: generateRecordId(record),
          };

          const request = store.put(recordWithId);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      })
    );

    processed += batch.length;
    if (processed % 10000 === 0) {
      console.log(
        `📦 [IndexedDB] Stored ${processed}/${data.length} records...`
      );
    }
  }

  const endTime = performance.now();
  console.log(
    `✅ [IndexedDB] Stored ${data.length} records in ${(
      (endTime - startTime) /
      1000
    ).toFixed(2)}s`
  );
}

/**
 * Get top N records sorted by date_receive (latest first)
 */
export async function getTopRecords(
  room: string,
  limit: number = 1000,
  sortBy: string = "date_receive"
): Promise<any[]> {
  const objectStore = await getObjectStore(room, "readonly");

  // Try to use index, fallback to objectStore if index doesn't exist
  let index: IDBIndex | IDBObjectStore;
  try {
    index = objectStore.index(`${sortBy}_idx`) || objectStore.index(sortBy);
  } catch {
    // If index doesn't exist, use objectStore directly
    index = objectStore;
  }

  return new Promise((resolve, reject) => {
    const results: any[] = [];
    let count = 0;

    // Use index to get records sorted by date_receive DESC
    const request = (index as IDBIndex).openCursor
      ? (index as IDBIndex).openCursor(null, "prev")
      : (index as IDBObjectStore).openCursor(null, "prev");

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor && count < limit) {
        results.push(cursor.value);
        count++;
        cursor.continue();
      } else {
        // Sort results by date_receive if we couldn't use index
        if (!(index as IDBIndex).openCursor && sortBy === "date_receive") {
          results.sort((a, b) => {
            const dateA = a.date_receive
              ? new Date(a.date_receive).getTime()
              : a.date_time
                ? new Date(a.date_time).getTime()
                : a.log_time
                  ? new Date(a.log_time).getTime()
                  : 0;
            const dateB = b.date_receive
              ? new Date(b.date_receive).getTime()
              : b.date_time
                ? new Date(b.date_time).getTime()
                : b.log_time
                  ? new Date(b.log_time).getTime()
                  : 0;
            return dateB - dateA; // Descending
          });
        }
        resolve(results);
      }
    };

    request.onerror = () => {
      console.error("❌ [IndexedDB] Error getting top records:", request.error);
      reject(request.error);
    };
  });
}

/**
 * Get next batch of records for infinite scroll
 */
export async function getNextBatch(
  room: string,
  offset: number,
  limit: number = 1000,
  sortBy: string = "date_receive"
): Promise<any[]> {
  const objectStore = await getObjectStore(room, "readonly");

  // Try to use index, fallback to objectStore if index doesn't exist
  let index: IDBIndex | IDBObjectStore;
  try {
    index = objectStore.index(`${sortBy}_idx`) || objectStore.index(sortBy);
  } catch {
    index = objectStore;
  }

  return new Promise((resolve, reject) => {
    const results: any[] = [];
    let currentOffset = 0;

    const request = (index as IDBIndex).openCursor
      ? (index as IDBIndex).openCursor(null, "prev")
      : (index as IDBObjectStore).openCursor(null, "prev");

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (!cursor) {
        resolve(results);
        return;
      }

      if (currentOffset < offset) {
        currentOffset++;
        cursor.continue();
        return;
      }

      if (results.length < limit) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };

    request.onerror = () => {
      console.error("❌ [IndexedDB] Error getting next batch:", request.error);
      reject(request.error);
    };
  });
}

/**
 * Update or insert a single record from socket data event
 */
export async function updateData(room: string, newData: any): Promise<void> {
  const objectStore = await getObjectStore(room, "readwrite");

  return new Promise((resolve, reject) => {
    const recordWithId = {
      ...newData,
      id: generateRecordId(newData),
    };

    const request = objectStore.put(recordWithId);
    request.onsuccess = () => {
      console.log(`✅ [IndexedDB] Updated record in room: ${room}`);
      resolve();
    };
    request.onerror = () => {
      console.error("❌ [IndexedDB] Error updating record:", request.error);
      reject(request.error);
    };
  });
}

/**
 * Search across IndexedDB for records matching search term
 */
export async function searchData(
  room: string,
  searchTerm: string,
  filters?: Record<string, any>,
  limit: number = 1000
): Promise<any[]> {
  if (!searchTerm && !filters) {
    return getTopRecords(room, limit);
  }

  const objectStore = await getObjectStore(room, "readonly");
  const results: any[] = [];
  const lowerSearchTerm = searchTerm?.toLowerCase().trim() || "";

  return new Promise((resolve, reject) => {
    const request = objectStore.openCursor();

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (!cursor) {
        resolve(results);
        return;
      }

      if (results.length >= limit) {
        resolve(results);
        return;
      }

      const record = cursor.value;
      let matches = true;

      // Apply search term
      if (lowerSearchTerm) {
        matches = Object.values(record).some((value) => {
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(lowerSearchTerm);
        });
      }

      // Apply filters
      if (matches && filters) {
        for (const [key, value] of Object.entries(filters)) {
          if (value && record[key] !== value) {
            matches = false;
            break;
          }
        }
      }

      if (matches) {
        results.push(record);
      }

      cursor.continue();
    };

    request.onerror = () => {
      console.error("❌ [IndexedDB] Error searching data:", request.error);
      reject(request.error);
    };
  });
}

/**
 * Get total count of records in a room
 */
export async function getTotalCount(room: string): Promise<number> {
  const objectStore = await getObjectStore(room, "readonly");

  return new Promise((resolve, reject) => {
    const request = objectStore.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all data for a room
 */
export async function clearData(room: string): Promise<void> {
  const objectStore = await getObjectStore(room, "readwrite");

  return new Promise((resolve, reject) => {
    const request = objectStore.clear();
    request.onsuccess = () => {
      console.log(`✅ [IndexedDB] Cleared data for room: ${room}`);
      resolve();
    };
    request.onerror = () => {
      console.error("❌ [IndexedDB] Error clearing data:", request.error);
      reject(request.error);
    };
  });
}

/**
 * Get the latest record timestamp for a room
 */
export async function getLatestTimestamp(room: string): Promise<number | null> {
  const records = await getTopRecords(room, 1);
  if (records.length === 0) return null;

  const record = records[0];
  const timestamp =
    record.date_receive || record.date_time || record.log_time || null;

  if (timestamp) {
    // Try to parse as date
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date.getTime();
  }

  return null;
}
