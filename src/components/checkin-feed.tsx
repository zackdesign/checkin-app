"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { CheckInWithDetails } from "@/lib/types";
import { CheckInCard } from "./checkin-card";

export function CheckInFeed({
  eventId,
  onAssign,
}: {
  eventId: string;
  onAssign?: (checkin: CheckInWithDetails) => void;
}) {
  const [checkins, setCheckins] = useState<CheckInWithDetails[]>([]);
  const [count, setCount] = useState(0);

  const fetchCheckins = useCallback(async () => {
    const { data } = await supabase
      .from("check_ins")
      .select("*, device:devices(*), profile:profiles(*)")
      .eq("event_id", eventId)
      .order("checked_in_at", { ascending: false })
      .limit(50);

    if (data) {
      setCheckins(data as CheckInWithDetails[]);
      setCount(data.length);
    }
  }, [eventId]);

  useEffect(() => {
    fetchCheckins();

    const channel = supabase
      .channel(`checkins:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "check_ins",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          // Re-fetch to get joined data
          fetchCheckins();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, fetchCheckins]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Check-ins
        </h2>
        <span className="rounded-full bg-accent/20 px-3 py-1 text-sm font-medium text-accent">
          {count}
        </span>
      </div>

      {checkins.length === 0 ? (
        <p className="py-8 text-center text-muted">
          No check-ins yet. Scan the QR code or tap an NFC tag.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {checkins.map((checkin, i) => (
            <CheckInCard
              key={checkin.id}
              checkin={checkin}
              onAssign={onAssign}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
