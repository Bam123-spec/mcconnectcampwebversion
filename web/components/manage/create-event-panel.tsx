"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatOfficerRole } from "@/lib/live-data";
import { hasOfficerCapability } from "@/lib/officer-capabilities";

type ProfileRow = {
  role?: string | null;
};

type OfficerClubRow = {
  club_id: string;
  role?: string | null;
  clubs?:
    | {
        name?: string | null;
      }
    | {
        name?: string | null;
      }[]
    | null;
};

type OfficerClub = {
  clubId: string;
  clubName: string;
  role: string;
};

const firstItem = <T,>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

export function CreateEventPanel() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [clubs, setClubs] = useState<OfficerClub[]>([]);
  const [selectedClubId, setSelectedClubId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    imageUrl: "",
  });

  useEffect(() => {
    let cancelled = false;

    const loadAccess = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setSignedIn(false);
          setIsAdmin(false);
          setClubs([]);
          setLoading(false);
        }
        return;
      }

      const [profileResult, officersResult] = await Promise.all([
        supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
        supabase
          .from("officers")
          .select("club_id, role, clubs(name)")
          .eq("user_id", user.id),
      ]);

      const profile = profileResult.data as ProfileRow | null;
      const officerRows = (officersResult.data ?? []) as OfficerClubRow[];
      const manageableClubs = officerRows
        .map((row) => {
          const club = firstItem(row.clubs);
          if (!row.club_id || !club?.name) return null;
          return {
            clubId: row.club_id,
            clubName: club.name,
            role: row.role || "officer",
          };
        })
        .filter(Boolean)
        .filter((row) => hasOfficerCapability((row as OfficerClub).role, "createEvents")) as OfficerClub[];

      if (!cancelled) {
        setSignedIn(true);
        setIsAdmin(profile?.role === "admin");
        setClubs(manageableClubs);
        setSelectedClubId((current) => current || manageableClubs[0]?.clubId || "");
        setLoading(false);
      }
    };

    loadAccess();
    return () => {
      cancelled = true;
    };
  }, []);

  const canCreate = isAdmin || clubs.length > 0;
  const selectedClub = useMemo(
    () => clubs.find((club) => club.clubId === selectedClubId) ?? clubs[0] ?? null,
    [clubs, selectedClubId]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedClub?.clubId || !form.title || !form.date || !form.time || !form.location) {
      setError("Fill in the required event details first.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const { error: insertError } = await supabase.from("events").insert([
      {
        club_id: selectedClub.clubId,
        name: form.title,
        description: form.description || null,
        date: form.date,
        day: form.date,
        time: form.time,
        location: form.location,
        cover_image_url: form.imageUrl || null,
      },
    ]);

    if (insertError) {
      setError(insertError.message || "Failed to create event.");
      setSubmitting(false);
      return;
    }

    setSuccess(`Event created for ${selectedClub.clubName}.`);
    setForm({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      imageUrl: "",
    });
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-[24px] border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]">
        <LoaderCircle size={16} className="animate-spin text-[#51237f]" />
        Loading event creation access.
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="rounded-[24px] border border-gray-200 bg-white p-8 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]">
        <h1 className="text-3xl font-bold tracking-[-0.02em] text-gray-950">Create club events after sign in</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600">
          Sign in first so we can verify which clubs you manage and which event tools your role allows.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center rounded-full bg-[#51237f] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#45206b]"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (!canCreate) {
    return (
      <div className="rounded-[24px] border border-gray-200 bg-white p-8 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]">
        <h1 className="text-3xl font-bold tracking-[-0.02em] text-gray-950">Your role can’t create events yet</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600">
          Presidents, Vice Presidents, Treasurers, and platform admins can create events from this workspace.
        </p>
        <Link
          href="/manage"
          className="mt-6 inline-flex items-center rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
        >
          Back to Manage
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[24px] border border-gray-200 bg-white p-8 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Create Event</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-gray-950">
          Launch a new event for your club
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600">
          Publish events directly from the officer workspace so members can RSVP from the main campus feed.
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-[24px] border border-gray-200 bg-white p-8 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-gray-900">Club</span>
            <select
              value={selectedClub?.clubId || ""}
              onChange={(event) => setSelectedClubId(event.target.value)}
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none ring-0 transition focus:border-[#51237f]"
            >
              {clubs.map((club) => (
                <option key={club.clubId} value={club.clubId}>
                  {club.clubName} · {formatOfficerRole(club.role)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-gray-900">Event title</span>
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#51237f]"
              placeholder="Weekly planning meeting"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-gray-900">Description</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="min-h-32 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#51237f]"
              placeholder="What is this event for and why should members show up?"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-gray-900">Date</span>
            <input
              type="date"
              value={form.date}
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#51237f]"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-gray-900">Time</span>
            <input
              value={form.time}
              onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#51237f]"
              placeholder="5:00 PM"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-gray-900">Location</span>
            <input
              value={form.location}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#51237f]"
              placeholder="Science West 301 or Zoom"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-gray-900">Cover image URL</span>
            <input
              value={form.imageUrl}
              onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#51237f]"
              placeholder="https://..."
            />
          </label>
        </div>

        {error ? (
          <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-full bg-[#51237f] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#45206b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating event..." : "Create Event"}
          </button>
          <Link
            href="/manage"
            className="inline-flex items-center rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
          >
            Back to Manage
          </Link>
        </div>
      </form>
    </div>
  );
}
