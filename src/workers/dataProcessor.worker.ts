/**
 * Data Processor Web Worker
 * Background processing for compression, indexing, and heavy operations
 */

import { compressChunk, buildChunkSearchIndex } from "../utils/compression";

// Message types
interface CompressMessage {
  type: "compress";
  id: string;
  records: any[];
  chunkSize?: number;
}

interface IndexMessage {
  type: "index";
  id: string;
  records: any[];
}

interface SearchMessage {
  type: "search";
  id: string;
  records: any[];
  query: string;
}

type WorkerMessage =
  | CompressMessage
  | IndexMessage
  | SearchMessage;

interface WorkerResponse {
  type: string;
  id: string;
  result: any;
  error?: string;
}

// Message handler
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;

  try {
    switch (message.type) {
      case "compress": {
        const compressed = compressChunk(
          message.records,
          message.chunkSize
        );
        const searchIndex = buildChunkSearchIndex(message.records);

        const response: WorkerResponse = {
          type: "compress",
          id: message.id,
          result: {
            compressed,
            searchIndex,
            recordCount: message.records.length,
            startTimestamp: message.records[0]?.timestamp || Date.now(),
            endTimestamp:
              message.records[message.records.length - 1]?.timestamp ||
              Date.now(),
          },
        };

        self.postMessage(response);
        break;
      }

      case "index": {
        const searchIndex = buildChunkSearchIndex(message.records);

        const response: WorkerResponse = {
          type: "index",
          id: message.id,
          result: searchIndex,
        };

        self.postMessage(response);
        break;
      }

      case "search": {
        const query = message.query.toLowerCase();
        const results = message.records.filter((record: any) => {
          const searchText = Object.values(record)
            .filter(
              (v) => typeof v === "string" || typeof v === "number"
            )
            .join(" ")
            .toLowerCase();
          return searchText.includes(query);
        });

        const response: WorkerResponse = {
          type: "search",
          id: message.id,
          result: results,
        };

        self.postMessage(response);
        break;
      }

      default:
        throw new Error(`Unknown message type: ${(message as any).type}`);
    }
  } catch (error) {
    const response: WorkerResponse = {
      type: message.type,
      id: message.id,
      result: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };

    self.postMessage(response);
  }
};

// Export for TypeScript
export {};

