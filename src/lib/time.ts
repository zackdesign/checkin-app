import parseDate from "postgres-date";

export function timeAgo(dateStr: string, now?: number): string {
  const date = parseDate(dateStr);
  if (!date || !(date instanceof Date)) return "just now";
  const seconds = Math.floor(((now ?? Date.now()) - date.getTime()) / 1000);
  if (seconds < 0) return "just now";
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
