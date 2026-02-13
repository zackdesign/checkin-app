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
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-lg animate-fade-in-up">
        <div className="mb-6">
          <Link
            href="/station"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            &larr; Station
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Profiles</h1>
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search profiles..."
          className="mb-4 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />

        {/* Profile list */}
        <div className="mb-8 flex flex-col gap-2">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-muted">
              {search ? "No matching profiles" : "No profiles yet"}
            </p>
          ) : (
            filtered.map((profile) => (
              <div
                key={profile.id}
                className="glass-card flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {profile.name}
                  </p>
                  {profile.email && (
                    <p className="text-xs text-muted">{profile.email}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteProfile(profile.id)}
                  className="rounded-lg p-1.5 text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Create profile */}
        <div className="glass-card p-4">
          <h2 className="mb-3 font-semibold text-foreground">
            Add Profile
          </h2>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name *"
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email (optional)"
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              onClick={createProfile}
              disabled={creating || !newName.trim()}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
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
