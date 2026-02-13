import pgParseDate from "postgres-date";
import { formatDistanceToNow } from "date-fns";

// postgres-date is CJS (module.exports = fn). Handle both bundler
// resolution styles: direct function or { default: fn }.
const parseDate: (isoDate: string) => Date | null =
  typeof pgParseDate === "function"
    ? pgParseDate
    : (pgParseDate as unknown as { default: typeof pgParseDate }).default;

export function timeAgo(dateStr: string): string {
  try {
    const date = parseDate(dateStr);
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "just now";
    }
    if (date.getTime() > Date.now()) return "just now";
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "just now";
  }
}
