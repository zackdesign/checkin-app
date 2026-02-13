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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-card rounded-none border-x-0 border-t-0 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <Link
              href="/station"
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              &larr; Events
            </Link>
            <h1 className="text-xl font-bold text-foreground">
              {event.name}
            </h1>
          </div>
          <Link
            href="/profiles"
            className="rounded-lg bg-surface-light px-4 py-2 text-sm font-medium text-foreground hover:bg-border transition-colors"
          >
            Profiles
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl p-6 animate-fade-in-up">
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
