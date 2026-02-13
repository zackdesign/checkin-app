/**
 * Normalize a Supabase timestamp to a reliable ISO 8601 string.
 * Supabase returns formats like "2026-02-13 05:52:06.136236+00"
 * which some mobile browsers (Android Chrome) fail to parse.
 */
export function normalizeTimestamp(dateStr: string): string {
  // Replace space separator with T for ISO 8601 compliance
  let normalized = dateStr.replace(" ", "T");

  // Fix short timezone offset: "+00" → "+00:00", "-05" → "-05:00"
  // Supabase returns "+00" which is not valid ISO 8601
  const shortTz = normalized.match(/([+-])(\d{2})$/);
  if (shortTz) {
    normalized = normalized.slice(0, -3) + `${shortTz[1]}${shortTz[2]}:00`;
  }

  // Append Z if no timezone indicator exists at all
  if (!/[Z]$/.test(normalized) && !/[+-]\d{2}:\d{2}$/.test(normalized)) {
    normalized += "Z";
  }

  return normalized;
}

export function timeAgo(dateStr: string, now?: number): string {
  const normalized = normalizeTimestamp(dateStr);
  const seconds = Math.floor(
    ((now ?? Date.now()) - new Date(normalized).getTime()) / 1000
  );
  if (seconds < 0) return "just now";
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
