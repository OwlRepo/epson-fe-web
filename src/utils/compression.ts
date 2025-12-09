/**
 * Compression utilities using LZ-String
 * Provides efficient compression/decompression for cold storage tier with chunking support
 */

import { compress, decompress } from "lz-string";

/**
 * Compress a record object to a string
 * Typical compression ratio: 60-70% size reduction
 */
export function compressRecord(record: any): string {
  try {
    const jsonString = JSON.stringify(record);
    return compress(jsonString);
  } catch (error) {
    console.error("Compression error:", error);
    throw new Error("Failed to compress record");
  }
}

/**
 * Decompress a string back to a record object
 */
export function decompressRecord<T = any>(compressedData: string): T {
  try {
    const jsonString = decompress(compressedData);
    if (!jsonString) {
      throw new Error("Decompression returned null");
    }
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Decompression error:", error);
    throw new Error("Failed to decompress record");
  }
}

/**
 * Compress an array of records
 * Returns array of { ID, compressed } objects
 */
export function compressRecords(
  records: any[]
): Array<{ ID: string | number; data: string }> {
  return records.map((record) => ({
    ID: record.ID,
    data: compressRecord(record),
  }));
}

/**
 * Decompress an array of compressed records
 */
export function decompressRecords<T = any>(
  compressedRecords: Array<{ ID: string | number; data: string }>
): T[] {
  return compressedRecords.map((item) => decompressRecord<T>(item.data));
}

/**
 * Compress a chunk of records for cold storage
 * @param records Array of records to compress
 * @param chunkSize Optional chunk size (default: 10000)
 * @returns Compressed string containing all records
 */
export function compressChunk(records: any[], chunkSize = 10000): string {
  try {
    if (records.length > chunkSize) {
      console.warn(
        `Chunk size ${records.length} exceeds recommended ${chunkSize}`
      );
    }
    const jsonString = JSON.stringify(records);
    return compress(jsonString);
  } catch (error) {
    console.error("Chunk compression error:", error);
    throw new Error("Failed to compress chunk");
  }
}

/**
 * Decompress a chunk of records from cold storage
 * @param compressedChunk Compressed string
 * @returns Array of decompressed records
 */
export function decompressChunk<T = any>(compressedChunk: string): T[] {
  try {
    const jsonString = decompress(compressedChunk);
    if (!jsonString) {
      throw new Error("Chunk decompression returned null");
    }
    const records = JSON.parse(jsonString);
    if (!Array.isArray(records)) {
      throw new Error("Decompressed chunk is not an array");
    }
    return records;
  } catch (error) {
    console.error("Chunk decompression error:", error);
    throw new Error("Failed to decompress chunk");
  }
}

/**
 * Estimate compressed size of records
 * @param records Array of records
 * @returns Estimated size in bytes
 */
export function estimateCompressedSize(records: any[]): number {
  try {
    const jsonString = JSON.stringify(records);
    const compressed = compress(jsonString);
    return new Blob([compressed]).size;
  } catch (error) {
    console.error("Size estimation error:", error);
    return 0;
  }
}

/**
 * Calculate compression ratio
 * Returns percentage of size reduction
 */
export function getCompressionRatio(
  original: string,
  compressed: string
): number {
  const originalSize = new Blob([original]).size;
  const compressedSize = new Blob([compressed]).size;
  return ((originalSize - compressedSize) / originalSize) * 100;
}

/**
 * Build searchable text from record for indexing
 * Concatenates all string/number values
 */
export function buildSearchText(record: any): string {
  return Object.values(record)
    .filter((v) => typeof v === "string" || typeof v === "number")
    .join(" ")
    ?.toLowerCase()
    .trim();
}

/**
 * Check if record matches a search query
 */
export function matchesQuery(record: any, query: string): boolean {
  const searchText = buildSearchText(record);
  return searchText.includes(query?.toLowerCase());
}

/**
 * Build search index for a chunk of records
 * Returns array of searchable text snippets
 */
export function buildChunkSearchIndex(records: any[]): string[] {
  return records.map((record) => buildSearchText(record));
}

/**
 * Check if a chunk matches a search query based on its index
 * @param searchIndex Array of searchable text snippets
 * @param query Search query string
 * @returns true if any record in chunk matches
 */
export function chunkMatchesQuery(
  searchIndex: string[],
  query: string
): boolean {
  const lowerQuery = query?.toLowerCase();
  return searchIndex.some((text) => text.includes(lowerQuery));
}
