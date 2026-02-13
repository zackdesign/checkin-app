"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getOrCreateDeviceId } from "@/lib/device";
import { Event } from "@/lib/types";

type CheckInState = "idle" | "loading" | "success" | "error";

function SuccessCheckmark() {
  return (
    <div className="relative animate-scale-in">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-success/20 animate-success-glow">
        <svg
          className="h-14 w-14"
          viewBox="0 0 52 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="26"
            cy="26"
            r="25"
            stroke="#22c55e"
            strokeWidth="2"
            fill="none"
            className="animate-checkmark-circle"
          />
          <path
            d="M14 27l8 8 16-16"
            stroke="#22c55e"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="animate-checkmark-draw"
          />
        </svg>
      </div>
      {/* Floating particles */}
      <div className="absolute -top-2 left-1/2 h-2 w-2 rounded-full bg-success animate-float-up" style={{ animationDelay: "0.2s" }} />
      <div className="absolute top-0 -left-3 h-1.5 w-1.5 rounded-full bg-accent animate-float-up" style={{ animationDelay: "0.4s" }} />
      <div className="absolute top-0 -right-3 h-1.5 w-1.5 rounded-full bg-nfc-blue animate-float-up" style={{ animationDelay: "0.6s" }} />
      <div className="absolute -top-1 left-1/4 h-1 w-1 rounded-full bg-success animate-float-up" style={{ animationDelay: "0.3s" }} />
      <div className="absolute -top-1 right-1/4 h-1 w-1 rounded-full bg-accent animate-float-up" style={{ animationDelay: "0.5s" }} />
    </div>
  );
}

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

      // Detect platform
      const ua = navigator.userAgent;
      const deviceType = /iPad|iPhone|iPod/.test(ua)
        ? ("ios" as const)
        : /Android/.test(ua)
          ? ("android" as const)
          : ("web" as const);

      // Upsert device
      const { data: device, error: deviceError } = await supabase
        .from("devices")
        .upsert(
          {
            device_identifier: deviceIdentifier,
            device_type: deviceType,
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm text-center animate-fade-in-up">
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          {event.name}
        </h1>
        {event.description && (
          <p className="mb-8 text-muted">{event.description}</p>
        )}

        {state === "success" ? (
          <div className="flex flex-col items-center gap-4">
            <SuccessCheckmark />
            <p className="text-lg font-semibold text-success mt-2">
              Checked in!
            </p>
            <button
              onClick={() => setState("idle")}
              className="mt-4 text-sm text-muted underline hover:text-foreground transition-colors"
            >
              Check in again
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleCheckIn}
              disabled={state === "loading"}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 px-8 py-5 text-lg font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all"
            >
              {state === "loading" ? "Checking in..." : "Check In"}
            </button>

            {state === "error" && error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
