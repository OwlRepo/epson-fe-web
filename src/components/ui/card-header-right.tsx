import countShortener from "@/utils/count-shortener";
import React from "react";

interface CardHeaderRightProps {
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  clockedIn?: number | string;
  clockedOut?: number | string;
}

export default function CardHeaderRight({
  title,
  subtitle,
  clockedIn,
  clockedOut,
}: CardHeaderRightProps) {
  return (
    <div className="flex flex-col items-end gap-1">
      {typeof title === "string" || !title ? (
        <b className="text-[20px] text-primary">
          {title ? title : "Total Logs"}
        </b>
      ) : (
        title
      )}
      {typeof subtitle === "string" || subtitle ? (
        <p className="text-muted-foreground text-sm">{subtitle}</p>
      ) : (
        <div className="flex flex-row space-x-10">
          {clockedIn && (
            <div className="flex flex-row space-x-2">
              <p>Incoming:</p>
              <b className="text-positive">{countShortener(clockedIn ?? 0)}</b>
            </div>
          )}
          {clockedOut && (
            <div className="flex flex-row space-x-2">
              <p>Outgoing:</p>
              <b className="text-negative">{countShortener(clockedOut ?? 0)}</b>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
