"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getOrCreateDeviceId } from "@/lib/device";
import { Event } from "@/lib/types";

type CheckInState = "idle" | "loading" | "success" | "error";

const BURST_PARTICLES = [
  { x: "-40px", y: "-50px", color: "bg-success", size: "h-2.5 w-2.5", delay: "0s" },
  { x: "45px", y: "-35px", color: "bg-accent", size: "h-2 w-2", delay: "0.05s" },
  { x: "50px", y: "20px", color: "bg-nfc-blue", size: "h-2.5 w-2.5", delay: "0.1s" },
  { x: "-45px", y: "30px", color: "bg-yellow-400", size: "h-2 w-2", delay: "0.05s" },
  { x: "10px", y: "-55px", color: "bg-pink-400", size: "h-1.5 w-1.5", delay: "0.08s" },
  { x: "-20px", y: "50px", color: "bg-success", size: "h-1.5 w-1.5", delay: "0.12s" },
  { x: "35px", y: "45px", color: "bg-accent", size: "h-2 w-2", delay: "0s" },
  { x: "-50px", y: "-10px", color: "bg-cyan-400", size: "h-1.5 w-1.5", delay: "0.06s" },
  { x: "25px", y: "-50px", color: "bg-yellow-400", size: "h-2 w-2", delay: "0.03s" },
  { x: "-30px", y: "-40px", color: "bg-pink-400", size: "h-2 w-2", delay: "0.1s" },
];

const CONFETTI = [
  { x: "-60px", y: "-80px", drift: "15px", spin: "400deg", color: "bg-success", delay: "0.1s" },
  { x: "50px", y: "-90px", drift: "-20px", spin: "-300deg", color: "bg-accent", delay: "0.15s" },
  { x: "-30px", y: "-70px", drift: "-10px", spin: "500deg", color: "bg-yellow-400", delay: "0.2s" },
  { x: "70px", y: "-60px", drift: "8px", spin: "-400deg", color: "bg-pink-400", delay: "0.12s" },
  { x: "-80px", y: "-50px", drift: "20px", spin: "350deg", color: "bg-nfc-blue", delay: "0.25s" },
  { x: "20px", y: "-95px", drift: "-5px", spin: "-450deg", color: "bg-cyan-400", delay: "0.18s" },
];

function SuccessCheckmark() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
      {/* Expanding ring */}
      <div
        className="absolute inset-0 rounded-full border-2 border-success/40 animate-ring-expand"
        style={{ animationDelay: "0.2s" }}
      />
      <div
        className="absolute inset-0 rounded-full border border-accent/30 animate-ring-expand"
        style={{ animationDelay: "0.4s" }}
      />

      {/* Burst particles */}
      {BURST_PARTICLES.map((p, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${p.color} ${p.size} animate-burst-out`}
          style={{
            "--bx": p.x,
            "--by": p.y,
            animationDelay: p.delay,
            top: "50%",
            left: "50%",
            marginTop: "-4px",
            marginLeft: "-4px",
          } as React.CSSProperties}
        />
      ))}

      {/* Confetti pieces */}
      {CONFETTI.map((c, i) => (
        <div
          key={`c${i}`}
          className={`absolute ${c.color} animate-confetti-fall`}
          style={{
            "--cx": c.x,
            "--cy": c.y,
            "--drift": c.drift,
            "--spin": c.spin,
            animationDelay: c.delay,
            top: "50%",
            left: "50%",
            width: i % 2 === 0 ? "8px" : "6px",
            height: i % 2 === 0 ? "3px" : "6px",
            borderRadius: i % 2 === 0 ? "1px" : "50%",
          } as React.CSSProperties}
        />
      ))}

      {/* Main checkmark */}
      <div className="animate-bounce-in">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-success/20 animate-success-glow">
          <svg
            className="h-16 w-16"
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
      </div>
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
