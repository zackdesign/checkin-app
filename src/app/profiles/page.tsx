"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/lib/types";

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("name");
    if (data) setProfiles(data);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const filtered = profiles.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const createProfile = async () => {
    if (!newName.trim()) return;
    setCreating(true);

    await supabase.from("profiles").insert({
      name: newName.trim(),
      email: newEmail.trim() || null,
    });

    setNewName("");
    setNewEmail("");
    setCreating(false);
    fetchProfiles();
  };

  const deleteProfile = async (id: string) => {
    await supabase.from("profiles").delete().eq("id", id);
    fetchProfiles();
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-lg">
        <div className="mb-6">
          <Link
            href="/station"
            className="text-sm text-zinc-500 hover:text-zinc-700"
          >
            &larr; Station
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900">Profiles</h1>
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search profiles..."
          className="mb-4 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />

        {/* Profile list */}
        <div className="mb-8 flex flex-col gap-2">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-zinc-400">
              {search ? "No matching profiles" : "No profiles yet"}
            </p>
          ) : (
            filtered.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm"
              >
                <div>
                  <p className="font-medium text-zinc-900">
                    {profile.name}
                  </p>
                  {profile.email && (
                    <p className="text-xs text-zinc-500">{profile.email}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteProfile(profile.id)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Create profile */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold text-zinc-900">
            Add Profile
          </h2>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name *"
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email (optional)"
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <button
              onClick={createProfile}
              disabled={creating || !newName.trim()}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors"
              onKeyDown={(e) => e.key === "Enter" && createProfile()}
            >
              Add Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
