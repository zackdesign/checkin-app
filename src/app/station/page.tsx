"use client";

import { EventSelector } from "@/components/event-selector";

export default function StationHome() {
  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-lg">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900">
            Check-In Station
          </h1>
          <p className="text-zinc-500">
            Select an event or create a new one.
          </p>
        </div>

        <EventSelector />
      </div>
    </div>
  );
}
