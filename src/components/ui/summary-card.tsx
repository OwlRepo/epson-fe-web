import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  items: Array<{
    label: string;
    value: string | number;
    valueColor?: string;
  }>;
  className?: string;
}

export function SummaryCard({ title, items, className }: SummaryCardProps) {
  return (
    <div className={cn("border border-gray-100 rounded p-4", className)}>
      <h3 className="font-semibold text-lg mb-4">{title}</h3>

      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-gray-600">{item.label}:</span>
            <span className={cn("font-semibold", item.valueColor)}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
