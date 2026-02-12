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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white p-6 shadow-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-900">
            Assign Profile
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-zinc-100 text-zinc-500"
          >
            ✕
          </button>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search profiles..."
          className="mb-3 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />

        <div className="flex-1 overflow-y-auto min-h-0 mb-4">
          {filtered.length === 0 && search && (
            <p className="py-4 text-center text-sm text-zinc-400">
              No profiles found
            </p>
          )}
          {filtered.map((profile) => (
            <button
              key={profile.id}
              onClick={() => assignProfile(profile.id)}
              disabled={loading}
              className="w-full text-left rounded-lg px-3 py-2 hover:bg-zinc-100 transition-colors disabled:opacity-50"
            >
              <p className="font-medium text-zinc-900">{profile.name}</p>
              {profile.email && (
                <p className="text-xs text-zinc-500">{profile.email}</p>
              )}
            </button>
          ))}
        </div>

        <div className="border-t border-zinc-200 pt-4">
          <p className="mb-2 text-sm font-medium text-zinc-600">
            Or create new:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name"
              className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === "Enter" && createAndAssign()}
            />
            <button
              onClick={createAndAssign}
              disabled={loading || !newName.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
