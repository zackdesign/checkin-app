import { describe, it, expect } from "vitest";
import { timeAgo } from "./time";

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

  it("parses exact Supabase format: space, microseconds, +00", () => {
    expect(timeAgo("2026-02-13 05:52:06.136236+00", now)).toBe("7m ago");
  });

  it("works with +00:00 offset", () => {
    expect(timeAgo("2026-02-13 05:50:00+00:00", now)).toBe("10m ago");
  });

  it("all Supabase timestamptz variants produce consistent results", () => {
    const variants = [
      "2026-02-13 05:50:00+00",
      "2026-02-13 05:50:00+00:00",
      "2026-02-13 05:50:00.000+00",
      "2026-02-13 05:50:00.000000+00",
    ];
    const results = variants.map((v) => timeAgo(v, now));
    expect(new Set(results).size).toBe(1);
    expect(results[0]).toBe("10m ago");
  });

  it("handles invalid input gracefully", () => {
    expect(timeAgo("", now)).toBe("just now");
    expect(timeAgo("garbage", now)).toBe("just now");
  });
});
