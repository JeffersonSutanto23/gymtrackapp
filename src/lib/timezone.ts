function pad(n: number) {
  return String(n).padStart(2, "0");
}

// This app is used in WIB (UTC+7) only, so the client offset is fixed
// rather than detected per-browser. Follows Date.prototype.getTimezoneOffset()
// convention: minutes the client's local time is behind UTC (UTC+7 → -420).
const WIB_OFFSET_MINUTES = -420;

export async function getClientOffsetMinutes(): Promise<number> {
  return WIB_OFFSET_MINUTES;
}
export function startOfClientDay(offsetMinutes: number, at: Date = new Date()): Date {
  const localWallClock = new Date(at.getTime() - offsetMinutes * 60_000);
  localWallClock.setUTCHours(0, 0, 0, 0);
  return new Date(localWallClock.getTime() + offsetMinutes * 60_000);
}

export function clientDateStr(offsetMinutes: number, at: Date = new Date()): string {
  const localWallClock = new Date(at.getTime() - offsetMinutes * 60_000);
  return `${localWallClock.getUTCFullYear()}-${pad(localWallClock.getUTCMonth() + 1)}-${pad(localWallClock.getUTCDate())}`;
}

export function clientDateStrToRange(dateStr: string, offsetMinutes: number): { start: Date; end: Date } {
  const [year, month, day] = dateStr.split("-").map(Number);
  const localWallClockMidnight = Date.UTC(year, month - 1, day);
  const start = new Date(localWallClockMidnight + offsetMinutes * 60_000);
  const end = new Date(start.getTime() + 24 * 60 * 60_000);
  return { start, end };
}
