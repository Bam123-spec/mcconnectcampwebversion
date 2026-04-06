"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type ClubRow = {
  id: string;
  name?: string | null;
  description?: string | null;
  cover_image_url?: string | null;
};

export function ClubEditPanel({ clubId }: { clubId: string }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    coverImageUrl: "",
  });

  useEffect(() => {
    let cancelled = false;

    const loadClub = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setError("Sign in to edit this club.");
          setLoading(false);
        }
        return;
      }

      const [{ data: profile }, { data: officer }, { data: club, error: clubError }] = await Promise.all([
        supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
        supabase.from("officers").select("club_id").eq("user_id", user.id).eq("club_id", clubId).maybeSingle(),
        supabase.from("clubs").select("id, name, description, cover_image_url").eq("id", clubId).maybeSingle(),
      ]);

      if (clubError || !club) {
        if (!cancelled) {
          setError("Club not found.");
          setLoading(false);
        }
        return;
      }

      if (profile?.role !== "admin" && !officer?.club_id) {
        if (!cancelled) {
          setError("You do not have editing access to this club.");
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        const typedClub = club as ClubRow;
        setAllowed(true);
        setImagePreviewUrl(typedClub.cover_image_url || null);
        setForm({
          name: typedClub.name || "",
          description: typedClub.description || "",
          coverImageUrl: typedClub.cover_image_url || "",
        });
        setLoading(false);
      }
    };

    loadClub();
    return () => {
      cancelled = true;
    };
  }, [clubId]);

  const handleImageSelection = (file: File | null) => {
    if (imagePreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    if (!file) {
      setSelectedImage(null);
      setImagePreviewUrl(form.coverImageUrl || null);
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

    let coverImageUrl = form.coverImageUrl || null;

    if (selectedImage) {
      const fileExtension = selectedImage.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeExtension = fileExtension.replace(/[^a-z0-9]/g, "") || "jpg";
      const filePath = `clubs/${clubId}/${Date.now()}-${form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${safeExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("clubconnect-assets")
        .upload(filePath, selectedImage, {
          cacheControl: "3600",
          contentType: selectedImage.type || undefined,
          upsert: false,
        });

      if (uploadError) {
        setError(uploadError.message || "We couldn't upload that club image right now.");
        setSubmitting(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("clubconnect-assets").getPublicUrl(filePath);

      coverImageUrl = publicUrl;
    }

    const { error: updateError } = await supabase
      .from("clubs")
      .update({
        name: form.name,
        description: form.description || null,
        cover_image_url: coverImageUrl,
      })
      .eq("id", clubId);

    if (updateError) {
      setError(updateError.message || "Failed to update club.");
      setSubmitting(false);
      return;
    }

    setForm((current) => ({ ...current, coverImageUrl: coverImageUrl || "" }));
    setSelectedImage(null);
    setImagePreviewUrl(coverImageUrl || null);
    setSuccess("Club details updated.");
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-[24px] border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]">
        <LoaderCircle size={16} className="animate-spin text-[#51237f]" />
        Loading club details.
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="rounded-[24px] border border-gray-200 bg-white p-8 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]">
        <h1 className="text-3xl font-bold tracking-[-0.02em] text-gray-950">Club editing unavailable</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600">{error || "You do not have access to edit this club."}</p>
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
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Edit Club</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-gray-950">Update club details</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600">
          Keep the club profile clean and current so members see the right identity, description, and artwork.
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-[24px] border border-gray-200 bg-white p-8 shadow-[0_18px_50px_-40px_rgba(17,24,39,0.35)]"
      >
        <div className="grid grid-cols-1 gap-6">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-gray-900">Club name</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#51237f]"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-gray-900">Description</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="min-h-32 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#51237f]"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-gray-900">Club cover image</span>
            <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 transition hover:border-[#51237f] hover:bg-[#faf7fd]">
              <span className="inline-flex items-center gap-2">
                <ImagePlus size={16} className="text-[#51237f]" />
                {selectedImage ? selectedImage.name : "Upload a cover image"}
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
            <p className="text-xs text-gray-500">Use a strong cover image so the club profile looks complete to members.</p>
          </label>
        </div>

        {imagePreviewUrl ? (
          <div className="mt-6 rounded-[24px] border border-gray-200 bg-[#fafafa] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Cover preview</p>
                <p className="text-xs text-gray-500">This will appear on the club profile and discovery cards.</p>
              </div>
              <button
                type="button"
                onClick={() => handleImageSelection(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 transition hover:bg-gray-50"
                aria-label="Remove uploaded club image"
              >
                <X size={15} />
              </button>
            </div>
            <div className="relative h-52 overflow-hidden rounded-[20px] border border-gray-200 bg-white">
              <Image src={imagePreviewUrl} alt="Club cover preview" fill className="object-cover" unoptimized />
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
            {submitting ? "Saving..." : "Save Club"}
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
