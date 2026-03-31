import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Clock3, X } from "lucide-react";

export type SyncReadinessStatus = "unknown" | "pending" | "ready";

interface SidebarReadinessNoticeProps {
  collapsed?: boolean;
  status: SyncReadinessStatus;
  hasReceivedStatus: boolean;
  pendingCount?: number | null;
  showPersistentNotice: boolean;
  onCloseNotice: () => void;
}

const getStatusConfig = (
  status: SyncReadinessStatus,
  hasReceivedStatus: boolean
) => {
  if (!hasReceivedStatus || status === "unknown") {
    return {
      label: "Waiting for sync status",
      description:
        "Waiting for server confirmation before evacuation can be completed.",
      icon: Clock3,
      className: "border-slate-300 bg-slate-50 text-slate-700",
    };
  }

  if (status === "pending") {
    return {
      label: "Sync in progress",
      description:
        "Some records are still being sent to EVS. Evacuation Complete is disabled.",
      icon: AlertTriangle,
      className: "border-amber-300 bg-amber-50 text-amber-800",
    };
  }

  return {
    label: "Ready for evacuation complete",
    description:
      "All records are synced. You can now proceed with Evacuation Complete.",
    icon: CheckCircle2,
    className: "border-green-300 bg-green-50 text-green-800",
  };
};

export function SidebarReadinessNotice({
  collapsed = false,
  status,
  hasReceivedStatus,
  pendingCount,
  showPersistentNotice,
  onCloseNotice,
}: SidebarReadinessNoticeProps) {
  const config = getStatusConfig(status, hasReceivedStatus);
  const Icon = config.icon;

  if (collapsed) {
    return (
      <div className={cn("w-full px-3")}>
        <div
          className={cn(
            "h-10 rounded-md border flex items-center justify-center",
            config.className
          )}
          aria-label={config.label}
          title={config.label}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-3 space-y-2">
      <div
        className={cn("rounded-md border p-3", config.className)}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-2">
          <Icon className="h-5 w-5 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-5">{config.label}</p>
            {status === "pending" && typeof pendingCount === "number" ? (
              <p className="text-xs mt-1">Pending records: {pendingCount}</p>
            ) : null}
          </div>
        </div>
      </div>

      {showPersistentNotice ? (
        <div
          className="rounded-md border border-green-300 bg-green-50 text-green-900 p-3"
          role="alert"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm leading-5 pr-1">
              EVS confirms no data is pending. You may now tap Evacuation
              Complete.
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 hover:bg-green-100"
              onClick={onCloseNotice}
              aria-label="Close readiness notification"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
