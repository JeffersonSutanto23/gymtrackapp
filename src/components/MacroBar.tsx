export function MacroBar({
  label,
  current,
  target,
  unit = "g",
  color,
}: {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color: string;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span className="text-neutral-600">{label}</span>
        <span className="text-neutral-600">
          {Math.round(current)} / {Math.round(target)} {unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-neutral-200 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
