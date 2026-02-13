import { describe, it, expect, vi, afterEach } from "vitest";
import { timeAgo } from "./time";

describe("timeAgo", () => {
  const now = Date.UTC(2026, 1, 13, 6, 0, 0);

  afterEach(() => {
    vi.useRealTimers();
  });

  function withFixedNow(fn: () => void) {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    fn();
  }

  it("shows relative time for recent timestamps", () => {
    withFixedNow(() => {
      const result = timeAgo("2026-02-13 05:55:00+00");
      expect(result).toBe("5 minutes ago");
    });
  });

  it("shows hours for older timestamps", () => {
    withFixedNow(() => {
      const result = timeAgo("2026-02-13 04:00:00+00");
      expect(result).toBe("about 2 hours ago");
    });
  });

  it("shows 'less than a minute ago' for very recent", () => {
    withFixedNow(() => {
      const result = timeAgo("2026-02-13 05:59:45+00");
      expect(result).toBe("less than a minute ago");
    });
  });

  it("parses exact Supabase format with microseconds", () => {
    withFixedNow(() => {
      const result = timeAgo("2026-02-13 05:52:06.136236+00");
      expect(result).toContain("ago");
    });
  });

  it("all Supabase variants produce consistent results", () => {
    withFixedNow(() => {
      const variants = [
        "2026-02-13 05:50:00+00",
        "2026-02-13 05:50:00+00:00",
        "2026-02-13 05:50:00.000+00",
        "2026-02-13 05:50:00.000000+00",
      ];
      const results = variants.map(timeAgo);
      expect(new Set(results).size).toBe(1);
      expect(results[0]).toBe("10 minutes ago");
    });
  });

  it("handles invalid input gracefully", () => {
    expect(timeAgo("")).toBe("just now");
    expect(timeAgo("garbage")).toBe("just now");
  });

  it("handles future timestamps", () => {
    withFixedNow(() => {
      expect(timeAgo("2026-02-13 06:05:00+00")).toBe("just now");
    });
  });
});
