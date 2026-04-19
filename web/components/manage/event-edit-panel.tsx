"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ImagePlus, LoaderCircle, X } from "lucide-react";
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
        });
        setImagePreviewUrl(typedEvent.cover_image_url || null);
        setLoading(false);
      }
    };

    loadEvent();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

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
    if (!allowed) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    let coverImageUrl = imagePreviewUrl && !imagePreviewUrl.startsWith("blob:") ? imagePreviewUrl : null;

    if (selectedImage) {
      const fileExtension = selectedImage.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeExtension = fileExtension.replace(/[^a-z0-9]/g, "") || "jpg";
      const filePath = `events/${clubId || "unassigned"}/${Date.now()}-${form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${safeExtension}`;

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

    const { error: updateError } = await supabase
      .from("events")
      .update({
        name: form.title,
        description: form.description || null,
        date: form.date,
        day: form.date,
        time: form.time,
        location: form.location,
        cover_image_url: coverImageUrl,
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
      <div className="flex items-center gap-3 rounded-[24px] border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
        <LoaderCircle size={16} className="animate-spin text-[#51237f]" />
        Loading event details.
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="rounded-[28px] border border-gray-200 bg-white p-8 shadow-sm">
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
    <div className="space-y-10">
      <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Edit Event</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-gray-950">Update event details</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600">
          Keep event info accurate so members see the right date, place, and context before they RSVP.
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm md:p-8"
      >
        <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
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
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-900">Cover image</span>
            <label className="flex min-h-[54px] cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 transition hover:border-[#51237f] hover:bg-[#faf7fd]">
              <span className="inline-flex items-center gap-2">
                <ImagePlus size={16} className="text-[#51237f]" />
                {selectedImage ? selectedImage.name : imagePreviewUrl ? "Replace current cover" : "Upload event cover"}
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
            <p className="text-xs text-gray-500">Upload a new event image or remove the current one.</p>
          </div>
        </div>

        {imagePreviewUrl ? (
          <div className="mt-8 rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Cover preview</p>
                <p className="text-xs text-gray-500">This image will be used on the event card and detail page.</p>
              </div>
              <button
                type="button"
                onClick={() => handleImageSelection(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 transition hover:bg-gray-50"
                aria-label="Remove event cover image"
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
