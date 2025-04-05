import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  icon: string;
  title: string;
  subtitle: string;
  href: string;
  className?: string;
}

export function ModuleCard({
  icon,
  title,
  subtitle,
  href,
  className,
}: ModuleCardProps) {
  return (
    <Link
      to={href}
      className={cn(
        "group flex h-[200px] w-full flex-col items-center justify-center rounded-2xl bg-white p-8 transition-all hover:scale-[1.02] hover:shadow-lg",
        "border-gray-200 border hover:border-blue-800",
        className
      )}
    >
      <img
        src={icon}
        alt={`${title} ${subtitle}`}
        className="mb-6 h-[80px] w-[80px] transition-transform group-hover:scale-110"
      />
      <div className="text-center">
        <h3 className="text-xl font-bold text-[#1E3A8A]">{title}</h3>
        <p className="text-lg font-bold text-[#1E3A8A]">{subtitle}</p>
      </div>
    </Link>
  );
}
