"use client";

import { QRCodeSVG } from "qrcode.react";

export function QrCodeDisplay({ eventId }: { eventId: string }) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const url = `${origin}/checkin/${eventId}`;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <QRCodeSVG value={url} size={256} level="M" />
      </div>
      <p className="text-sm text-zinc-500 max-w-xs text-center break-all">
        {url}
      </p>
    </div>
  );
}
