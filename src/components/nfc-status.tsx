"use client";

export function NfcStatus({
  status,
  lastTag,
}: {
  status: "idle" | "scanning" | "unsupported";
  lastTag?: string | null;
}) {
  if (status === "unsupported") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm text-muted">
        <span className="h-2 w-2 rounded-full bg-muted" />
        NFC not available
      </div>
    );
  }

  if (status === "scanning") {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2 rounded-lg bg-nfc-blue/10 px-3 py-2 text-sm text-nfc-blue animate-pulse-glow">
          <span className="h-2 w-2 animate-pulse rounded-full bg-nfc-blue" />
          NFC scanning&hellip;
        </div>
        {lastTag && (
          <p className="text-xs text-muted">Last: {lastTag}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm text-muted">
      <span className="h-2 w-2 rounded-full bg-border" />
      NFC ready
    </div>
  );
}
