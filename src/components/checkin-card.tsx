"use client";

import { CheckInWithDetails } from "@/lib/types";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function CheckInCard({
  checkin,
  onAssign,
}: {
  checkin: CheckInWithDetails;
  onAssign?: (checkin: CheckInWithDetails) => void;
}) {
  const profileName = checkin.profile?.name;
  const deviceLabel =
    checkin.device?.label || checkin.device?.device_identifier || "Unknown";
  const isNfc = checkin.source === "nfc";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${
          isNfc
            ? "bg-blue-100 text-blue-600"
            : "bg-green-100 text-green-600"
        }`}
      >
        {isNfc ? "📡" : "📱"}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-zinc-900 truncate">
          {profileName || "Unassigned"}
        </p>
        <p className="text-xs text-zinc-500 truncate">
          {isNfc ? "NFC" : "QR"} &middot; {deviceLabel} &middot;{" "}
          {timeAgo(checkin.checked_in_at)}
        </p>
      </div>

      {!profileName && onAssign && (
        <button
          onClick={() => onAssign(checkin)}
          className="shrink-0 rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200 transition-colors"
        >
          Assign
        </button>
      )}
    </div>
  );
}
