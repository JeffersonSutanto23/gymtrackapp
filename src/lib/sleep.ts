export function sleepHours(bedTime: Date | string, wakeTime: Date | string) {
  const ms = new Date(wakeTime).getTime() - new Date(bedTime).getTime();
  return ms / (1000 * 60 * 60);
}

const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

export function formatTime(date: Date | string) {
  return timeFormatter.format(new Date(date));
}
