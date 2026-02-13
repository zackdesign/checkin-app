/**
 * Parse a Supabase timestamp into a UTC epoch millisecond value
 * without relying on new Date(string), which is inconsistent
 * across browsers (especially Android Chrome).
 *
 * Handles: "2026-02-13 05:52:06.136236+00"
 *          "2026-02-13T05:52:06.136236+00:00"
 *          "2026-02-13T05:52:06Z"
 *          "2026-02-13 05:52:06"
 */
export function parseTimestamp(dateStr: string): number {
  // Match: YYYY-MM-DD(T| )HH:MM:SS(.fractional)?(+/-HH(:MM)?|Z)?
  const m = dateStr.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(?:Z|([+-])(\d{2})(?::?(\d{2}))?)?$/
  );

  if (!m) {
    // Fallback to Date constructor if regex doesn't match
    return new Date(dateStr).getTime();
  }

  const year = parseInt(m[1], 10);
  const month = parseInt(m[2], 10) - 1; // JS months are 0-indexed
  const day = parseInt(m[3], 10);
  const hour = parseInt(m[4], 10);
  const min = parseInt(m[5], 10);
  const sec = parseInt(m[6], 10);

  // Parse fractional seconds → milliseconds
  let ms = 0;
  if (m[7]) {
    ms = parseInt(m[7].slice(0, 3).padEnd(3, "0"), 10);
  }

  // Build UTC timestamp
  const utcMs = Date.UTC(year, month, day, hour, min, sec, ms);

  // Apply timezone offset if present (not Z)
  if (m[8]) {
    const sign = m[8] === "+" ? 1 : -1;
    const offsetH = parseInt(m[9], 10);
    const offsetM = parseInt(m[10] || "0", 10);
    const offsetMs = sign * (offsetH * 60 + offsetM) * 60 * 1000;
    return utcMs - offsetMs;
  }

  // Z or no timezone → treat as UTC
  return utcMs;
}

export function timeAgo(dateStr: string, now?: number): string {
  const timestamp = parseTimestamp(dateStr);
  const seconds = Math.floor(((now ?? Date.now()) - timestamp) / 1000);
  if (seconds < 0) return "just now";
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
