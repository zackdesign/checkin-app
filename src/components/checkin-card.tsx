"use client";

import { CheckInWithDetails } from "@/lib/types";

function timeAgo(dateStr: string): string {
  // Supabase returns "2026-02-13 02:00:00+00:00" — the space breaks
  // parsing on some mobile browsers. Always use ISO 8601 T separator,
  // and append Z if no timezone indicator exists.
  let normalized = dateStr.replace(" ", "T");
  if (!/[Z+\-]\d{0,2}:?\d{0,2}$/.test(normalized)) {
    normalized += "Z";
  }
  const seconds = Math.floor(
    (Date.now() - new Date(normalized).getTime()) / 1000
  );
  if (seconds < 0) return "just now";
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function NfcIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36" />
      <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58" />
      <path d="M12.91 4.1a15.91 15.91 0 0 1 0 15.8" />
      <path d="M16.37 2a20.16 20.16 0 0 1 0 20" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function AndroidIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V7H6v11zM3.5 7C2.67 7 2 7.67 2 8.5v7c0 .83.67 1.5 1.5 1.5S5 16.33 5 15.5v-7C5 7.67 4.33 7 3.5 7zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48A5.84 5.84 0 0 0 12 0c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31A5.983 5.983 0 0 0 6 6h12c0-2.21-1.24-4.15-3.47-5.84zM10 4H9V3h1v1zm5 0h-1V3h1v1z" />
    </svg>
  );
}

function QrCodeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="8" height="8" rx="1" />
      <rect x="14" y="2" width="8" height="8" rx="1" />
      <rect x="2" y="14" width="8" height="8" rx="1" />
      <rect x="5" y="5" width="2" height="2" />
      <rect x="17" y="5" width="2" height="2" />
      <rect x="5" y="17" width="2" height="2" />
      <path d="M14 14h2v2h-2z" />
      <path d="M20 14h2v2h-2z" />
      <path d="M14 20h2v2h-2z" />
      <path d="M20 20h2v2h-2z" />
      <path d="M17 17h2v2h-2z" />
    </svg>
  );
}

type DeviceType = "nfc" | "ios" | "android" | "web";

function getDeviceInfo(checkin: CheckInWithDetails): {
  icon: React.ReactNode;
  label: string;
  colorClass: string;
} {
  const deviceType = checkin.device?.device_type as DeviceType | undefined;
  const isNfc = checkin.source === "nfc";

  if (isNfc) {
    return {
      icon: <NfcIcon />,
      label: "NFC",
      colorClass: "bg-nfc-blue/20 text-nfc-blue",
    };
  }

  if (deviceType === "ios") {
    return {
      icon: <AppleIcon />,
      label: "iOS",
      colorClass: "bg-foreground/10 text-foreground",
    };
  }

  if (deviceType === "android") {
    return {
      icon: <AndroidIcon />,
      label: "Android",
      colorClass: "bg-success/20 text-success",
    };
  }

  return {
    icon: <QrCodeIcon />,
    label: "QR",
    colorClass: "bg-accent/20 text-accent",
  };
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
  const { icon, label, colorClass } = getDeviceInfo(checkin);
  const staggerClass = index <= 4 ? `stagger-${index + 1}` : "";
  const canAssign = !profileName && onAssign;

  const content = (
    <>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colorClass}`}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-foreground truncate">
            {profileName || "Unassigned"}
          </p>
          {canAssign && (
            <span className="shrink-0 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-medium text-accent leading-none">assign</span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted truncate">
          {label} &middot; {deviceLabel} &middot;{" "}
          {timeAgo(checkin.checked_in_at)}
        </p>
      </div>
    </>
  );

  if (canAssign) {
    return (
      <button
        onClick={() => onAssign(checkin)}
        className={`glass-card flex items-center gap-3 px-3 py-2.5 text-left w-full animate-slide-in-right hover:border-accent/30 active:bg-surface-light transition-all ${staggerClass}`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={`glass-card flex items-center gap-3 px-3 py-2.5 animate-slide-in-right ${staggerClass}`}>
      {content}
    </div>
  );
}
