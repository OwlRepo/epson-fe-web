import { buildReadCommand } from "@/utils/rfidReaderCommand";
import { useRef, useCallback, useState } from "react";

export function useRFIDReader() {
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<string | null>(null);

  const read = useCallback(
    async (port: any, epcHex: string): Promise<string | undefined> => {
      setLoading(true);
      setError(null);

      try {
        const readCmd = buildReadCommand(epcHex);

        const writer = port.writable?.getWriter();
        if (!writer) throw new Error("Port is not writable");
        await writer.write(readCmd);
        writer.releaseLock();

        if (!port.readable) {
          throw new Error("Port is not readable.");
        }

        // Cancel and clean previous reader if needed
        if (readerRef.current) {
          try {
            await readerRef.current.cancel();
          } catch (err) {
            console.warn("Error cancelling reader:", err);
          }
          try {
            readerRef.current.releaseLock();
          } catch (err) {
            console.warn("Error releasing reader:", err);
          }
          readerRef.current = null;
        }

        await new Promise((res) => setTimeout(res, 100));

        const reader = port.readable.getReader();
        readerRef.current = reader;

        const timeout = 1000;
        const startTime = Date.now();
        let buffer: number[] = [];

        while (Date.now() - startTime < timeout) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) buffer.push(...value);

          if (buffer.length >= 10) {
            const reCmd = buffer[2];
            const status = buffer[3];

            console.log("Raw:", buffer.map((b) => b.toString(16)).join(""));

            if (reCmd !== 0x02 || status !== 0x00) {
              throw new Error("Error or not a read response");
            }

            const dataBytes = buffer.slice(4, -2);
            const hexString = dataBytes
              .map((b) => b.toString(16).padStart(2, "0"))
              .join("")
              .toUpperCase();

            return hexString;
          }
        }

        throw new Error("Timeout: No valid response received.");
      } catch (err) {
        console.error("RFID Read Error:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (readerRef.current) {
          try {
            readerRef.current.releaseLock();
          } catch (err) {
            console.warn("Error releasing reader in finally:", err);
          }
          readerRef.current = null;
        }
        setLoading(false);
      }
    },
    []
  );

  return {
    read,
    loading,
    error,
  };
}
