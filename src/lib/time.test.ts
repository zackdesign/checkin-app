import { describe, it, expect } from "vitest";
import { parseTimestamp, timeAgo } from "./time";

describe("parseTimestamp", () => {
  // Reference: 2026-02-13T06:00:00Z = 1770847200000
  const ref = Date.UTC(2026, 1, 13, 6, 0, 0);

  it("parses exact Supabase format: space, microseconds, +00", () => {
    const result = parseTimestamp("2026-02-13 05:52:06.136236+00");
    expect(result).not.toBeNaN();
    // Should be close to 2026-02-13T05:52:06.136Z
    const expected = Date.UTC(2026, 1, 13, 5, 52, 6, 136);
    expect(result).toBe(expected);
  });

  it("parses space-separated with +00:00", () => {
    const result = parseTimestamp("2026-02-13 05:52:06+00:00");
    expect(result).toBe(Date.UTC(2026, 1, 13, 5, 52, 6));
  });

  it("parses ISO with T and Z", () => {
    const result = parseTimestamp("2026-02-13T05:52:06Z");
    expect(result).toBe(Date.UTC(2026, 1, 13, 5, 52, 6));
  });

  it("parses ISO with T and +00:00", () => {
    const result = parseTimestamp("2026-02-13T05:52:06+00:00");
    expect(result).toBe(Date.UTC(2026, 1, 13, 5, 52, 6));
  });

  it("parses timestamp without timezone as UTC", () => {
    const result = parseTimestamp("2026-02-13 05:52:06");
    expect(result).toBe(Date.UTC(2026, 1, 13, 5, 52, 6));
  });

  it("handles negative timezone offset", () => {
    // 05:52:06-05:00 = 10:52:06 UTC
    const result = parseTimestamp("2026-02-13 05:52:06-05:00");
    expect(result).toBe(Date.UTC(2026, 1, 13, 10, 52, 6));
  });

  it("handles positive timezone offset", () => {
    // 05:52:06+13:00 = previous day 16:52:06 UTC
    const result = parseTimestamp("2026-02-13 05:52:06+13:00");
    expect(result).toBe(Date.UTC(2026, 1, 12, 16, 52, 6));
  });

  it("handles short +00 offset (Supabase default)", () => {
    const result = parseTimestamp("2026-02-13 05:52:06+00");
    expect(result).toBe(Date.UTC(2026, 1, 13, 5, 52, 6));
  });

  it("truncates microseconds to milliseconds", () => {
    const a = parseTimestamp("2026-02-13 05:52:06.123456+00");
    const b = parseTimestamp("2026-02-13 05:52:06.123+00");
    expect(a).toBe(b);
  });

  it("pads short fractional seconds", () => {
    const result = parseTimestamp("2026-02-13 05:52:06.1+00");
    expect(result).toBe(Date.UTC(2026, 1, 13, 5, 52, 6, 100));
  });

  it("all Supabase variants produce the same epoch", () => {
    const variants = [
      "2026-02-13 05:50:00+00",
      "2026-02-13 05:50:00+00:00",
      "2026-02-13 05:50:00.000+00",
      "2026-02-13 05:50:00.000000+00",
      "2026-02-13T05:50:00Z",
      "2026-02-13T05:50:00+00:00",
      "2026-02-13 05:50:00",
    ];
    const results = variants.map(parseTimestamp);
    const unique = new Set(results);
    expect(unique.size).toBe(1);
    expect(results[0]).toBe(Date.UTC(2026, 1, 13, 5, 50, 0));
  });
});

describe("timeAgo", () => {
  const now = Date.UTC(2026, 1, 13, 6, 0, 0);

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
    expect(timeAgo("2026-02-13 05:52:06.136236+00", now)).toBe("7m ago");
  });

  it("works with no timezone (treated as UTC)", () => {
    expect(timeAgo("2026-02-13 05:50:00", now)).toBe("10m ago");
  });

  it("works with ISO Z format", () => {
    expect(timeAgo("2026-02-13T05:50:00Z", now)).toBe("10m ago");
  });
});
