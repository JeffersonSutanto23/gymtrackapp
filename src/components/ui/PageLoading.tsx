import { Loader2 } from "lucide-react";

export function PageLoading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24 text-neutral-400">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  );
}
