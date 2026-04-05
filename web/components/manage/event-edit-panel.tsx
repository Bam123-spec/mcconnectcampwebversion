"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

type EventRow = {
  id: string;
  club_id?: string | null;
  name?: string | null;
  description?: string | null;
  date?: string | null;
  day?: string | null;
  time?: string | null;
  location?: string | null;
  cover_image_url?: string | null;
};

export function EventEditPanel({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [clubId, setClubId] = useState("");
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

    const loadEvent = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setError("Sign in to edit this event.");
          setLoading(false);
        }
        return;
      }

      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("id, club_id, name, description, date, day, time, location, cover_image_url")
        .eq("id", eventId)
        .maybeSingle();

      if (eventError || !event) {
        if (!cancelled) {
          setError("Event not found.");
          setLoading(false);
        }
        return;
      }

      const typedEvent = event as EventRow;
      const [{ data: profile }, { data: officer }] = await Promise.all([
        supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
        supabase
          .from("officers")
          .select("club_id")
          .eq("user_id", user.id)
          .eq("club_id", typedEvent.club_id)
          .maybeSingle(),
      ]);

      if (profile?.role !== "admin" && !officer?.club_id) {
        if (!cancelled) {
          setError("You do not have editing access to this event.");
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setAllowed(true);
        setClubId(typedEvent.club_id || "");
        setForm({
          title: typedEvent.name || "",
          description: typedEvent.description || "",
          date: typedEvent.date || typedEvent.day || "",
          time: typedEvent.time || "",
          location: typedEvent.location || "",
          imageUrl: typedEvent.cover_image_url || "",
        });
        setLoading(false);
      }
    };

    loadEvent();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!allowed) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const { error: updateError } = await supabase
      .from("events")
      .update({
        name: form.title,
        description: form.description || null,
        date: form.date,
        day: form.date,
        time: form.time,
        location: form.location,
        cover_image_url: form.imageUrl || null,
      })
      .eq("id", eventId);

    if (updateError) {
      setError(updateError.message || "Failed to update event.");
      setSubmitting(false);
      return;
    }

    setSuccess("Event updated.");
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-[24px] border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]">
        <LoaderCircle size={16} className="animate-spin text-[#51237f]" />
        Loading event details.
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="rounded-[24px] border border-gray-200 bg-white p-8 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]">
        <h1 className="text-3xl font-bold tracking-[-0.02em] text-gray-950">Event editing unavailable</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600">{error || "You do not have access to edit this event."}</p>
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
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Edit Event</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-gray-950">Update event details</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600">
          Keep event info accurate so members see the right date, place, and context before they RSVP.
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-[24px] border border-gray-200 bg-white p-8 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-gray-900">Event title</span>
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#51237f]"
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-gray-900">Description</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="min-h-32 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#51237f]"
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
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-gray-900">Location</span>
            <input
              value={form.location}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#51237f]"
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
            {submitting ? "Saving..." : "Save Event"}
          </button>
          <Link
            href={clubId ? "/manage" : "/manage"}
            className="inline-flex items-center rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
          >
            Back to Manage
          </Link>
        </div>
      </form>
    </div>
  );
}
