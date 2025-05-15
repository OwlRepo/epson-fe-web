import { useState, useCallback, useEffect } from "react";

interface SerialPort {
  open: (options: { baudRate: number }) => Promise<void>;
  close: () => Promise<void>;
}

export function useSerialPort() {
  const [port, setPort] = useState<SerialPort | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const connect = useCallback(async () => {
    try {
      const selectedPort = await navigator.serial.requestPort();
      await selectedPort.open({ baudRate: 9600 });
      setPort(selectedPort);
      setIsOpen(true);
      setError(null);
    } catch (err) {
      console.error("Serial connection failed:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (port) {
      try {
        await port.close();
      } catch (err) {
        console.warn("Error closing port:", err);
      } finally {
        setPort(null);
        setIsOpen(false);
      }
    }
  }, [port]);

  useEffect(() => {
    return () => {
      if (port) {
        port.close().catch(console.warn);
      }
    };
  }, [port]);

  return {
    port,
    isOpen,
    error,
    connect,
    disconnect,
  };
}
