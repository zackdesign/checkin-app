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
      <div className="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-500">
        <span className="h-2 w-2 rounded-full bg-zinc-400" />
        NFC not available
      </div>
    );
  }

  if (status === "scanning") {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
          <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
          NFC scanning&hellip;
        </div>
        {lastTag && (
          <p className="text-xs text-zinc-400">Last: {lastTag}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-500">
      <span className="h-2 w-2 rounded-full bg-zinc-300" />
      NFC ready
    </div>
  );
}
