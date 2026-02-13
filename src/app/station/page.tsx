"use client";

import { EventSelector } from "@/components/event-selector";
import { InstallPrompt } from "@/components/install-prompt";

export default function StationHome() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-lg animate-fade-in-up">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Check-In Station
          </h1>
          <p className="text-muted">
            Select an event or create a new one.
          </p>
        </div>

        <div className="mb-8">
          <InstallPrompt />
        </div>
        <EventSelector />
      </div>
    </div>
  );
}
