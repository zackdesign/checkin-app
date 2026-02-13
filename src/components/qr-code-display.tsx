"use client";

import { QRCodeSVG } from "qrcode.react";

export function QrCodeDisplay({ eventId }: { eventId: string }) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const url = `${origin}/checkin/${eventId}`;

  return (
    <div className="flex flex-col items-center gap-4 animate-scale-in">
      <div className="gradient-border">
        <div className="rounded-2xl bg-white p-6">
          <QRCodeSVG value={url} size={256} level="M" />
        </div>
      </div>
      <p className="text-sm text-muted max-w-xs text-center break-all">
        {url}
      </p>
    </div>
  );
}
