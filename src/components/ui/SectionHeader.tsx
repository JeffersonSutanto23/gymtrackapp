import type { LucideIcon } from "lucide-react";

export function SectionHeader({
  icon: Icon,
  title,
  action,
  className = "mb-4",
}: {
  icon?: LucideIcon;
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <h2 className="flex items-center gap-2 font-semibold text-neutral-900">
        {Icon && <Icon className="h-4 w-4 text-neutral-400" />}
        {title}
      </h2>
      {action}
    </div>
  );
}
