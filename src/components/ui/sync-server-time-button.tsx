import { useSocketEmit } from "@/hooks";
import { Button } from "./button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import useToastStyleTheme from "@/hooks/useToastStyleTheme";
import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "syncServerTimeDisabledUntil";

function getRemainingDisabledMs() {
  const until = localStorage.getItem(STORAGE_KEY);
  if (!until) return 0;
  const untilDate = parseInt(until, 10);
  const now = Date.now();
  const diff = untilDate - now;
  return diff > 0 ? diff : 0;
}

export default function SyncServerTimeButton() {
  const { emitWithAck } = useSocketEmit();
  const { errorStyle, successStyle } = useToastStyleTheme();
  const [isDisabled, setIsDisabled] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // On mount, check if we need to persist disabled state
  useEffect(() => {
    const remaining = getRemainingDisabledMs();
    if (remaining > 0) {
      setIsDisabled(true);
      timeoutRef.current = setTimeout(() => {
        setIsDisabled(false);
        localStorage.removeItem(STORAGE_KEY);
      }, remaining);
    }
    // Clear timer if component unmounts
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSyncServerTime = () => {
    emitWithAck("sync_time", "", (response) => {
      if (response.ok) {
        toast.success("Server time synced successfully", {
          style: successStyle,
        });
        const disabledUntil = Date.now() + 60 * 1000;
        localStorage.setItem(STORAGE_KEY, disabledUntil.toString());
        setIsDisabled(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setIsDisabled(false);
          localStorage.removeItem(STORAGE_KEY);
        }, 60 * 1000);
      } else {
        toast.error("Failed to sync server time", {
          style: errorStyle,
        });
      }
    });
  };

  return (
    <Button
      onClick={handleSyncServerTime}
      className="w-full mt-2"
      disabled={isDisabled}
    >
      <RefreshCw />
      Sync Server Time
    </Button>
  );
}
