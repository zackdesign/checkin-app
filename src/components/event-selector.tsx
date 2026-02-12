"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Event } from "@/lib/types";

export function EventSelector() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (data) setEvents(data);
    };
    fetchEvents();
  }, []);

  const createEvent = async () => {
    if (!newName.trim()) return;
    setCreating(true);

    const { data } = await supabase
      .from("events")
      .insert({ name: newName.trim() })
      .select()
      .single();

    if (data) {
      router.push(`/station/${data.id}`);
    }
    setCreating(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="mb-3 text-lg font-semibold text-zinc-900">
          Active Events
        </h2>
        {events.length === 0 ? (
          <p className="py-6 text-center text-zinc-400">
            No active events. Create one below.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => router.push(`/station/${event.id}`)}
                className="w-full text-left rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm hover:border-zinc-300 hover:shadow transition-all"
              >
                <p className="font-medium text-zinc-900">{event.name}</p>
                <p className="text-xs text-zinc-500">
                  {new Date(event.created_at).toLocaleDateString()}
                  {event.description && ` — ${event.description}`}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-zinc-200 pt-6">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900">
          Create New Event
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Event name"
            className="flex-1 rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            onKeyDown={(e) => e.key === "Enter" && createEvent()}
          />
          <button
            onClick={createEvent}
            disabled={creating || !newName.trim()}
            className="rounded-xl bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
