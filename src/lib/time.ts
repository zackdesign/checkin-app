import parseDate from "postgres-date";
import { formatDistanceToNow } from "date-fns";

export function timeAgo(dateStr: string): string {
  const date = parseDate(dateStr);
  if (!date || !(date instanceof Date)) return "just now";
  if (date.getTime() > Date.now()) return "just now";
  return formatDistanceToNow(date, { addSuffix: true });
}
