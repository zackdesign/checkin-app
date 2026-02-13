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

function NfcIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-6 11-6 11 6 11 6-4 6-11 6S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

export function CheckInCard({
  checkin,
  onAssign,
  index = 0,
}: {
  checkin: CheckInWithDetails;
  onAssign?: (checkin: CheckInWithDetails) => void;
  index?: number;
}) {
  const profileName = checkin.profile?.name;
  const deviceLabel =
    checkin.device?.label || checkin.device?.device_identifier || "Unknown";
  const isNfc = checkin.source === "nfc";
  const staggerClass = index <= 4 ? `stagger-${index + 1}` : "";

  return (
    <div className={`glass-card flex items-center gap-3 px-4 py-3 animate-slide-in-right ${staggerClass}`}>
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          isNfc
            ? "bg-nfc-blue/20 text-nfc-blue"
            : "bg-success/20 text-success"
        }`}
      >
        {isNfc ? <NfcIcon /> : <PhoneIcon />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">
          {profileName || "Unassigned"}
        </p>
        <p className="text-xs text-muted truncate">
          {isNfc ? "NFC" : "QR"} &middot; {deviceLabel} &middot;{" "}
          {timeAgo(checkin.checked_in_at)}
        </p>
      </div>

      {!profileName && onAssign && (
        <button
          onClick={() => onAssign(checkin)}
          className="shrink-0 rounded-lg bg-surface-light px-3 py-1.5 text-sm font-medium text-foreground hover:bg-border transition-colors"
        >
          Assign
        </button>
      )}
    </div>
  );
}
