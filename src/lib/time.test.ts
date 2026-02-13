import { describe, it, expect } from "vitest";
import { normalizeTimestamp, timeAgo } from "./time";

describe("normalizeTimestamp", () => {
  it("handles exact Supabase timestamptz format: space separator, +00 offset", () => {
    const result = normalizeTimestamp("2026-02-13 05:52:06.136236+00");
    expect(result).toBe("2026-02-13T05:52:06.136236+00:00");
  });

  it("handles Supabase format with +00:00 offset", () => {
    const result = normalizeTimestamp("2026-02-13 05:52:06+00:00");
    expect(result).toBe("2026-02-13T05:52:06+00:00");
  });

  it("handles timestamp without timezone — appends Z", () => {
    const result = normalizeTimestamp("2026-02-13 05:52:06");
    expect(result).toBe("2026-02-13T05:52:06Z");
  });

  it("handles ISO 8601 with T separator and Z", () => {
    const result = normalizeTimestamp("2026-02-13T05:52:06Z");
    expect(result).toBe("2026-02-13T05:52:06Z");
  });

  it("handles ISO 8601 with T separator and +00:00", () => {
    const result = normalizeTimestamp("2026-02-13T05:52:06+00:00");
    expect(result).toBe("2026-02-13T05:52:06+00:00");
  });

  it("handles negative timezone offset", () => {
    const result = normalizeTimestamp("2026-02-13 05:52:06-05:00");
    expect(result).toBe("2026-02-13T05:52:06-05:00");
  });

  it("handles Supabase microseconds with short offset", () => {
    const result = normalizeTimestamp("2026-02-13 05:52:06.136236+00");
    // Should parse to a valid date
    const date = new Date(result);
    expect(date.getTime()).not.toBeNaN();
  });
});

describe("timeAgo", () => {
  // Use a fixed "now" for deterministic tests
  // 2026-02-13T06:00:00Z in ms
  const now = new Date("2026-02-13T06:00:00Z").getTime();

  it("shows 'just now' for timestamps < 60s ago", () => {
    expect(timeAgo("2026-02-13 05:59:30+00", now)).toBe("just now");
  });

  it("shows minutes for timestamps 1-59 min ago", () => {
    expect(timeAgo("2026-02-13 05:55:00+00", now)).toBe("5m ago");
  });

  it("shows hours for timestamps 60+ min ago", () => {
    expect(timeAgo("2026-02-13 04:00:00+00", now)).toBe("2h ago");
  });

  it("shows 'just now' for future timestamps", () => {
    expect(timeAgo("2026-02-13 06:05:00+00", now)).toBe("just now");
  });

  it("parses exact Supabase format correctly", () => {
    // 8 minutes before "now"
    expect(timeAgo("2026-02-13 05:52:06.136236+00", now)).toBe("7m ago");
  });

  it("parses space-separated format without timezone as UTC", () => {
    // Without timezone should be treated as UTC
    expect(timeAgo("2026-02-13 05:50:00", now)).toBe("10m ago");
  });

  it("parses ISO format with Z correctly", () => {
    expect(timeAgo("2026-02-13T05:50:00Z", now)).toBe("10m ago");
  });

  it("gives consistent results for all Supabase timestamp variants", () => {
    const variants = [
      "2026-02-13 05:50:00+00",
      "2026-02-13 05:50:00+00:00",
      "2026-02-13 05:50:00.000000+00",
      "2026-02-13T05:50:00Z",
      "2026-02-13T05:50:00+00:00",
    ];
    const results = variants.map((v) => timeAgo(v, now));
    // All should produce the same result
    expect(new Set(results).size).toBe(1);
    expect(results[0]).toBe("10m ago");
  });
});
