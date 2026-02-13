import { formatDistanceToNow } from "date-fns";

/**
 * Parse a Supabase/PostgreSQL timestamp into a UTC epoch ms value.
 * Does NOT use new Date(string) which is inconsistent across browsers.
 *
 * Handles: "2026-02-13 05:52:06.136236+00"
 *          "2026-02-13 05:52:06+00:00"
 *          "2026-02-13T05:52:06Z"
 *          "2026-02-13 05:52:06"
 */
function parseTimestamp(dateStr: string): number {
  const m = dateStr.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(?:Z|([+-])(\d{2})(?::?(\d{2}))?)?$/
  );
  if (!m) return NaN;

  const year = parseInt(m[1], 10);
  const month = parseInt(m[2], 10) - 1;
  const day = parseInt(m[3], 10);
  const hour = parseInt(m[4], 10);
  const min = parseInt(m[5], 10);
  const sec = parseInt(m[6], 10);
  const ms = m[7] ? parseInt(m[7].slice(0, 3).padEnd(3, "0"), 10) : 0;

  const utcMs = Date.UTC(year, month, day, hour, min, sec, ms);

  if (m[8]) {
    const sign = m[8] === "+" ? 1 : -1;
    const offsetMs = sign * (parseInt(m[9], 10) * 60 + parseInt(m[10] || "0", 10)) * 60000;
    return utcMs - offsetMs;
  }

  return utcMs;
}

export function timeAgo(dateStr: string): string {
  const ms = parseTimestamp(dateStr);
  if (isNaN(ms) || ms > Date.now()) return "just now";
  return formatDistanceToNow(new Date(ms), { addSuffix: true });
}
