import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <Icon className="h-7 w-7 text-neutral-300" />
      <p className="text-sm text-neutral-500">{message}</p>
    </div>
  );
}
