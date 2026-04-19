"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ImagePlus, LoaderCircle, X } from "lucide-react";
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

export function CreateEventPanel({ initialClubId }: { initialClubId?: string }) {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [clubs, setClubs] = useState<OfficerClub[]>([]);
  const [selectedClubId, setSelectedClubId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
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
        setSelectedClubId((current) => {
          if (current) return current;
          if (initialClubId && manageableClubs.some((club) => club.clubId === initialClubId)) {
            return initialClubId;
          }
          return manageableClubs[0]?.clubId || "";
        });
        setLoading(false);
      }
    };

    loadAccess();
    return () => {
      cancelled = true;
    };
  }, [initialClubId]);

  const canCreate = isAdmin || clubs.length > 0;
  const selectedClub = useMemo(
    () => clubs.find((club) => club.clubId === selectedClubId) ?? clubs[0] ?? null,
    [clubs, selectedClubId]
  );

  const handleImageSelection = (file: File | null) => {
    if (imagePreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    if (!file) {
      setSelectedImage(null);
      setImagePreviewUrl(null);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedImage(file);
    setImagePreviewUrl(previewUrl);
  };

  useEffect(() => {
    return () => {
      if (imagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedClub?.clubId || !form.title || !form.date || !form.time || !form.location) {
      setError("Fill in the required event details first.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    let coverImageUrl: string | null = null;

    if (selectedImage) {
      const fileExtension = selectedImage.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeExtension = fileExtension.replace(/[^a-z0-9]/g, "") || "jpg";
      const filePath = `events/${selectedClub.clubId}/${Date.now()}-${form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${safeExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("clubconnect-assets")
        .upload(filePath, selectedImage, {
          cacheControl: "3600",
          contentType: selectedImage.type || undefined,
          upsert: false,
        });

      if (uploadError) {
        setError("We couldn't upload that cover image right now. Please try another file.");
        setSubmitting(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("clubconnect-assets").getPublicUrl(filePath);

      coverImageUrl = publicUrl;
    }

    const { error: insertError } = await supabase.from("events").insert([
      {
        club_id: selectedClub.clubId,
        name: form.title,
        description: form.description || null,
        date: form.date,
        day: form.date,
        time: form.time,
        location: form.location,
        cover_image_url: coverImageUrl,
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
    });
    handleImageSelection(null);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-[24px] border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
        <LoaderCircle size={16} className="animate-spin text-[#51237f]" />
        Loading event creation access.
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="rounded-[28px] border border-gray-200 bg-white p-8 shadow-sm">
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
      <div className="rounded-[28px] border border-gray-200 bg-white p-8 shadow-sm">
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
    <div className="space-y-10">
      <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm md:p-8">
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
        className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm md:p-8"
      >
        <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
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

          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-900">Cover image</span>
            <label className="flex min-h-[54px] cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 transition hover:border-[#51237f] hover:bg-[#faf7fd]">
              <span className="inline-flex items-center gap-2">
                <ImagePlus size={16} className="text-[#51237f]" />
                {selectedImage ? selectedImage.name : "Upload event cover"}
              </span>
              <span className="rounded-full bg-[#f4ecfb] px-3 py-1 text-xs font-semibold text-[#51237f]">
                Choose file
              </span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => handleImageSelection(event.target.files?.[0] || null)}
              />
            </label>
            <p className="text-xs text-gray-500">This image will appear on the event card and event detail page.</p>
          </div>
        </div>

        {imagePreviewUrl ? (
          <div className="mt-8 rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Cover preview</p>
                <p className="text-xs text-gray-500">Check how the event image will look before publishing.</p>
              </div>
              <button
                type="button"
                onClick={() => handleImageSelection(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 transition hover:bg-gray-50"
                aria-label="Remove uploaded cover image"
              >
                <X size={15} />
              </button>
            </div>
            <div className="relative h-56 overflow-hidden rounded-[20px] border border-gray-200 bg-[#fafafa]">
              <Image src={imagePreviewUrl} alt="Event cover preview" fill className="object-cover" unoptimized />
            </div>
          </div>
        ) : null}

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
