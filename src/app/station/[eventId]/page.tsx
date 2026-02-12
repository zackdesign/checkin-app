"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Event, CheckInWithDetails } from "@/lib/types";
import { QrCodeDisplay } from "@/components/qr-code-display";
import { CheckInFeed } from "@/components/checkin-feed";
import { NfcReader } from "@/components/nfc-reader";
import { ProfileSelector } from "@/components/profile-selector";

export default function StationEventPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [assigningCheckin, setAssigningCheckin] =
    useState<CheckInWithDetails | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();
      if (data) setEvent(data);
    };
    fetchEvent();
  }, [eventId]);

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <Link
              href="/station"
              className="text-sm text-zinc-500 hover:text-zinc-700"
            >
              &larr; Events
            </Link>
            <h1 className="text-xl font-bold text-zinc-900">
              {event.name}
            </h1>
          </div>
          <Link
            href="/profiles"
            className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 transition-colors"
          >
            Profiles
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl p-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          {/* Left: QR Code + NFC */}
          <div className="flex flex-col items-center gap-8">
            <QrCodeDisplay eventId={eventId} />
            <NfcReader eventId={eventId} />
          </div>

          {/* Right: Live feed */}
          <div>
            <CheckInFeed
              eventId={eventId}
              onAssign={(checkin) => setAssigningCheckin(checkin)}
            />
          </div>
        </div>
      </main>

      {/* Profile assignment dialog */}
      {assigningCheckin && (
        <ProfileSelector
          checkin={assigningCheckin}
          onClose={() => setAssigningCheckin(null)}
          onAssigned={() => setAssigningCheckin(null)}
        />
      )}
    </div>
  );
}
