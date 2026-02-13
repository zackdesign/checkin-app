"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Profile, CheckInWithDetails } from "@/lib/types";

export function ProfileSelector({
  checkin,
  onClose,
  onAssigned,
}: {
  checkin: CheckInWithDetails;
  onClose: () => void;
  onAssigned: () => void;
}) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("name");
      if (data) setProfiles(data);
    };
    fetchProfiles();
  }, []);

  const filtered = profiles.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const assignProfile = async (profileId: string) => {
    setLoading(true);

    // Update check-in
    await supabase
      .from("check_ins")
      .update({ profile_id: profileId })
      .eq("id", checkin.id);

    // Update device to remember this profile
    if (checkin.device_id) {
      await supabase
        .from("devices")
        .update({ profile_id: profileId })
        .eq("id", checkin.device_id);
    }

    setLoading(false);
    onAssigned();
  };

  const createAndAssign = async () => {
    if (!newName.trim()) return;
    setLoading(true);

    const { data: profile } = await supabase
      .from("profiles")
      .insert({ name: newName.trim() })
      .select()
      .single();

    if (profile) {
      await assignProfile(profile.id);
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl max-h-[80vh] flex flex-col animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Assign Profile
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-surface-light text-muted transition-colors"
          >
            ✕
          </button>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search profiles..."
          className="mb-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          autoFocus
        />

        <div className="flex-1 overflow-y-auto min-h-0 mb-4">
          {filtered.length === 0 && search && (
            <p className="py-4 text-center text-sm text-muted">
              No profiles found
            </p>
          )}
          {filtered.map((profile) => (
            <button
              key={profile.id}
              onClick={() => assignProfile(profile.id)}
              disabled={loading}
              className="w-full text-left rounded-lg px-3 py-2 hover:bg-surface-light transition-colors disabled:opacity-50"
            >
              <p className="font-medium text-foreground">{profile.name}</p>
              {profile.email && (
                <p className="text-xs text-muted">{profile.email}</p>
              )}
            </button>
          ))}
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-2 text-sm font-medium text-muted">
            Or create new:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name"
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              onKeyDown={(e) => e.key === "Enter" && createAndAssign()}
            />
            <button
              onClick={createAndAssign}
              disabled={loading || !newName.trim()}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
