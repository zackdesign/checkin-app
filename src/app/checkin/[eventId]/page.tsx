"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getOrCreateDeviceId } from "@/lib/device";
import { Event } from "@/lib/types";

type CheckInState = "idle" | "loading" | "success" | "error";

export default function CheckInPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [state, setState] = useState<CheckInState>("idle");
  const [error, setError] = useState<string | null>(null);

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

  const handleCheckIn = async () => {
    setState("loading");
    setError(null);

    try {
      const deviceIdentifier = getOrCreateDeviceId();

      // Upsert device
      const { data: device, error: deviceError } = await supabase
        .from("devices")
        .upsert(
          {
            device_identifier: deviceIdentifier,
            device_type: "web" as const,
          },
          { onConflict: "device_identifier" }
        )
        .select()
        .single();

      if (deviceError || !device) {
        throw new Error(deviceError?.message || "Failed to register device");
      }

      // Insert check-in
      const { error: checkinError } = await supabase
        .from("check_ins")
        .insert({
          event_id: eventId,
          device_id: device.id,
          profile_id: device.profile_id,
          source: "qr_web" as const,
        });

      if (checkinError) {
        throw new Error(checkinError.message);
      }

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }

      setState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check-in failed");
      setState("error");
    }
  };

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="mb-2 text-2xl font-bold text-zinc-900">
          {event.name}
        </h1>
        {event.description && (
          <p className="mb-8 text-zinc-500">{event.description}</p>
        )}

        {state === "success" ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
              ✓
            </div>
            <p className="text-lg font-semibold text-green-700">
              Checked in!
            </p>
            <button
              onClick={() => setState("idle")}
              className="mt-4 text-sm text-zinc-500 underline"
            >
              Check in again
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleCheckIn}
              disabled={state === "loading"}
              className="w-full rounded-2xl bg-zinc-900 px-8 py-5 text-lg font-semibold text-white shadow-lg hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 transition-all"
            >
              {state === "loading" ? "Checking in..." : "Check In"}
            </button>

            {state === "error" && error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
