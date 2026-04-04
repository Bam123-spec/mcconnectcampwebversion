"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Edit3, MapPin, Save, ShieldCheck, Users, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { slugifyClubName } from "@/lib/club-utils";

type ClubProfile = {
  id: string;
  name: string;
  description: string;
  coverImageUrl: string | null;
  memberCount: number;
  meetingTime: string;
  slug: string;
};

type ClubEvent = {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
};

const fallbackCover =
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1600&auto=format&fit=crop";

const formatEventDate = (value: string) => {
  if (!value) return "Date to be announced";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export function ClubProfilePanel({
  initialClub,
  initialEvents,
}: {
  initialClub: ClubProfile;
  initialEvents: ClubEvent[];
}) {
  const router = useRouter();
  const [club, setClub] = useState(initialClub);
  const [events] = useState(initialEvents);
  const [canEdit, setCanEdit] = useState(false);
  const [checkedAccess, setCheckedAccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    name: initialClub.name,
    description: initialClub.description,
    meetingTime: initialClub.meetingTime,
    coverImageUrl: initialClub.coverImageUrl || "",
  });

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setCheckedAccess(true);
        return;
      }

      const [{ data: profile }, { data: officerRow }] = await Promise.all([
        supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
        supabase
          .from("officers")
          .select("id")
          .eq("club_id", initialClub.id)
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      setCanEdit(profile?.role === "admin" || Boolean(officerRow));
      setCheckedAccess(true);
    };

    checkAccess();
  }, [initialClub.id]);

  const clubBadge = useMemo(() => club.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(), [club.name]);

  const handleCancel = () => {
    setDraft({
      name: club.name,
      description: club.description,
      meetingTime: club.meetingTime,
      coverImageUrl: club.coverImageUrl || "",
    });
    setError(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    const payload = {
      name: draft.name.trim(),
      description: draft.description.trim() || null,
      meeting_time: draft.meetingTime.trim() || null,
      cover_image_url: draft.coverImageUrl.trim() || null,
    };

    const { error: updateError } = await supabase
      .from("clubs")
      .update(payload)
      .eq("id", club.id);

    if (updateError) {
      console.error("Error updating club profile:", updateError);
      setError("We couldn't save your club changes.");
      setIsSaving(false);
      return;
    }

    const nextSlug = slugifyClubName(payload.name || club.name);
    const nextClub = {
      ...club,
      name: payload.name || club.name,
      description: payload.description || "",
      meetingTime: payload.meeting_time || "",
      coverImageUrl: payload.cover_image_url,
      slug: nextSlug,
    };

    setClub(nextClub);
    setDraft({
      name: nextClub.name,
      description: nextClub.description,
      meetingTime: nextClub.meetingTime,
      coverImageUrl: nextClub.coverImageUrl || "",
    });
    setIsEditing(false);
    setIsSaving(false);

    if (nextSlug !== initialClub.slug) {
      router.replace(`/clubs/${nextSlug}`);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="bg-[#f5f6f8] min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/clubs" className="text-sm font-semibold text-[#51237f] hover:underline">
            Back to clubs
          </Link>

          {checkedAccess && canEdit && !isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 rounded-md bg-[#51237f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#45206b] transition-colors"
            >
              <Edit3 size={16} />
              Edit club page
            </button>
          ) : null}
        </div>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="relative h-56 w-full bg-gray-100">
            <Image
              src={club.coverImageUrl || fallbackCover}
              alt={club.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
          </div>

          <div className="px-6 pb-8 pt-0">
            <div className="relative -mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="flex items-end gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-xl border-4 border-white bg-[#51237f] text-2xl font-black text-white shadow-md">
                  {clubBadge}
                </div>
                <div className="pb-1">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Club Profile</p>
                  <h1 className="mt-1 text-3xl font-black tracking-tight text-gray-900">{club.name}</h1>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:flex md:items-center">
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Members</div>
                  <div className="mt-1 flex items-center gap-2 font-bold text-gray-900">
                    <Users size={16} className="text-[#51237f]" />
                    {club.memberCount}
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Meeting Time</div>
                  <div className="mt-1 flex items-center gap-2 font-bold text-gray-900">
                    <CalendarDays size={16} className="text-[#51237f]" />
                    {club.meetingTime || "TBA"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.7fr_1fr]">
              <div className="space-y-8">
                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#51237f]" />
                    <h2 className="text-lg font-bold text-gray-900">About this club</h2>
                  </div>

                  {isEditing ? (
                    <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-5">
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-gray-700">Club name</span>
                        <input
                          value={draft.name}
                          onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                          className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#51237f] focus:ring-2 focus:ring-[#51237f]/15"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-gray-700">Description</span>
                        <textarea
                          value={draft.description}
                          onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                          rows={5}
                          className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#51237f] focus:ring-2 focus:ring-[#51237f]/15"
                        />
                      </label>

                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-gray-700">Meeting time</span>
                          <input
                            value={draft.meetingTime}
                            onChange={(event) => setDraft((current) => ({ ...current, meetingTime: event.target.value }))}
                            placeholder="Wednesdays at 3:00 PM"
                            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#51237f] focus:ring-2 focus:ring-[#51237f]/15"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-gray-700">Cover image URL</span>
                          <input
                            value={draft.coverImageUrl}
                            onChange={(event) => setDraft((current) => ({ ...current, coverImageUrl: event.target.value }))}
                            placeholder="https://..."
                            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#51237f] focus:ring-2 focus:ring-[#51237f]/15"
                          />
                        </label>
                      </div>

                      {error ? (
                        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                          {error}
                        </div>
                      ) : null}

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={isSaving || !draft.name.trim()}
                          className="inline-flex items-center gap-2 rounded-md bg-[#51237f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#45206b] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Save size={16} />
                          {isSaving ? "Saving..." : "Save changes"}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={isSaving}
                          className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="max-w-3xl leading-7 text-gray-600">
                      {club.description || "This club has not added a public description yet."}
                    </p>
                  )}
                </section>

                <section>
                  <h2 className="mb-4 text-lg font-bold text-gray-900">Upcoming club events</h2>
                  <div className="space-y-3">
                    {events.length > 0 ? (
                      events.map((event) => (
                        <div
                          key={event.id}
                          className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
                        >
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                              <h3 className="text-base font-bold text-gray-900">{event.name}</h3>
                              <p className="mt-1 text-sm text-gray-500">{formatEventDate(event.date)} • {event.time}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                              <MapPin size={15} className="text-[#51237f]" />
                              {event.location}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center text-sm text-gray-600">
                        No upcoming club events are listed yet.
                      </div>
                    )}
                  </div>
                </section>
              </div>

              <aside className="space-y-6">
                <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h2 className="text-base font-bold text-gray-900">Quick Actions</h2>
                  <div className="mt-4 space-y-3">
                    <Link
                      href="/events"
                      className="block rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 hover:border-[#51237f] hover:text-[#51237f] transition-colors"
                    >
                      Browse campus events
                    </Link>
                    <Link
                      href="/activity"
                      className="block rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 hover:border-[#51237f] hover:text-[#51237f] transition-colors"
                    >
                      View my activity
                    </Link>
                  </div>
                </section>

                {checkedAccess && canEdit ? (
                  <section className="rounded-xl border border-purple-200 bg-purple-50 p-5">
                    <h2 className="text-base font-bold text-[#51237f]">Officer access enabled</h2>
                    <p className="mt-2 text-sm leading-6 text-[#51237f]/80">
                      You can update this club page directly from the web. Changes made here update the same club record used by the mobile app.
                    </p>
                  </section>
                ) : null}
              </aside>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
