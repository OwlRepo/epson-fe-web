export interface countDetails {
  icon?: React.ReactNode;
  label: string;
  count?: number | string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export interface EVSCountsProps {
  countData: countDetails[];
}

export default function CompactCount({ countData = [] }: EVSCountsProps) {
  return (
    <div className="flex items-center gap-3">
      {countData.map((item, index) => (
        <div
          key={index}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border ${item.bgColor} ${item.borderColor}`}
        >
          {item.icon}
          <span className={`text-sm font-semibold ${item.textColor}`}>
            {item.count}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
