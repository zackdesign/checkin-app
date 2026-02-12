"use client";

import { useState, useRef, useCallback } from "react";
import { isNfcSupported, startNfcReader } from "@/lib/nfc";
import { supabase } from "@/lib/supabase";
import { NfcStatus } from "./nfc-status";

const NFC_DEBOUNCE_MS = 5000;

export function NfcReader({ eventId }: { eventId: string }) {
  const [status, setStatus] = useState<
    "idle" | "scanning" | "unsupported"
  >(isNfcSupported() ? "idle" : "unsupported");
  const [lastTag, setLastTag] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const lastReadRef = useRef<{ serial: string; time: number } | null>(
    null
  );

  const handleTagRead = useCallback(
    async (serialNumber: string) => {
      // Debounce: ignore same tag within 5 seconds
      const now = Date.now();
      if (
        lastReadRef.current &&
        lastReadRef.current.serial === serialNumber &&
        now - lastReadRef.current.time < NFC_DEBOUNCE_MS
      ) {
        return;
      }
      lastReadRef.current = { serial: serialNumber, time: now };
      setLastTag(serialNumber);

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }

      // Upsert device
      const { data: device } = await supabase
        .from("devices")
        .upsert(
          {
            device_identifier: serialNumber,
            device_type: "nfc" as const,
          },
          { onConflict: "device_identifier" }
        )
        .select()
        .single();

      if (!device) return;

      // Insert check-in
      await supabase.from("check_ins").insert({
        event_id: eventId,
        device_id: device.id,
        profile_id: device.profile_id,
        source: "nfc" as const,
      });
    },
    [eventId]
  );

  const startScanning = async () => {
    try {
      const controller = await startNfcReader(
        handleTagRead,
        (error) => {
          console.error("NFC error:", error);
        }
      );
      controllerRef.current = controller;
      setStatus("scanning");
    } catch {
      setStatus("unsupported");
    }
  };

  const stopScanning = () => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setStatus("idle");
  };

  if (status === "unsupported") {
    return <NfcStatus status="unsupported" />;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <NfcStatus
        status={status === "scanning" ? "scanning" : "idle"}
        lastTag={lastTag}
      />

      {status === "idle" ? (
        <button
          onClick={startScanning}
          className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all"
        >
          Start NFC Scanning
        </button>
      ) : (
        <button
          onClick={stopScanning}
          className="rounded-xl bg-zinc-200 px-6 py-3 font-medium text-zinc-700 shadow-md hover:bg-zinc-300 active:scale-95 transition-all"
        >
          Stop Scanning
        </button>
      )}
    </div>
  );
}
