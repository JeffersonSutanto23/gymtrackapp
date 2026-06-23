function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function toDatetimeLocalValue(date: Date | string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
