import { cookies } from "next/headers";
import { TZ_OFFSET_COOKIE } from "@/lib/timezone-cookie";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export async function getClientOffsetMinutes(): Promise<number> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(TZ_OFFSET_COOKIE)?.value;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}

// `offsetMinutes` follows Date.prototype.getTimezoneOffset() convention:
// minutes the client's local time is behind UTC (e.g. UTC+7 reports -420).
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

// Formats a date/time as it would appear on the client's own device, given
// their tz offset — needed in Server Components, where toLocaleString()/
// Intl.DateTimeFormat(undefined, ...) would otherwise use the SERVER's
// timezone instead of the actual end user's.
export function formatClientDateTime(at: Date | string, offsetMinutes: number, options: Intl.DateTimeFormatOptions = {}): string {
  const localWallClock = new Date(new Date(at).getTime() - offsetMinutes * 60_000);
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(localWallClock);
}
