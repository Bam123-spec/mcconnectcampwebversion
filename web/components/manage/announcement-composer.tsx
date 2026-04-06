"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImagePlus, LoaderCircle, Megaphone, X } from "lucide-react";
import { getClubPath } from "@/lib/club-utils";
import { formatOfficerRole } from "@/lib/live-data";
import { supabase } from "@/lib/supabase";

type OfficerClubRow = {
  club_id?: string | null;
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
  id: string;
  name: string;
  roleLabel: string;
};

const MAX_ANNOUNCEMENT_IMAGE_SIZE = 8 * 1024 * 1024;

const joinAnnouncementContent = (title: string, message: string) => {
  const cleanTitle = title.trim();
  const cleanMessage = message.trim();
  const normalizedTitle = /[.!?]$/.test(cleanTitle) ? cleanTitle : `${cleanTitle}.`;
  return `${normalizedTitle} ${cleanMessage}`.trim();
};

export function AnnouncementComposer({ initialClubId }: { initialClubId?: string }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [officerClubs, setOfficerClubs] = useState<OfficerClub[]>([]);
  const [selectedClubId, setSelectedClubId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadClubs = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error: officerError } = await supabase
        .from("officers")
        .select("club_id, role, clubs(name)")
        .eq("user_id", user.id)
        .limit(20);

      if (officerError) {
        if (!cancelled) {
          setError("We couldn't load your club access right now.");
          setLoading(false);
        }
        return;
      }

      const nextClubs = ((data ?? []) as OfficerClubRow[])
        .map((row) => {
          const club = Array.isArray(row.clubs) ? row.clubs[0] : row.clubs;
          if (!row.club_id || !club?.name) return null;

          return {
            id: row.club_id,
            name: club.name,
            roleLabel: formatOfficerRole(row.role),
          };
        })
        .filter(Boolean) as OfficerClub[];

      if (!cancelled) {
        setOfficerClubs(nextClubs);
        setSelectedClubId(
          initialClubId && nextClubs.some((club) => club.id === initialClubId)
            ? initialClubId
            : nextClubs[0]?.id || ""
        );
        setLoading(false);
      }
    };

    loadClubs();

    return () => {
      cancelled = true;
    };
  }, [initialClubId, router]);

  const selectedClub = useMemo(
    () => officerClubs.find((club) => club.id === selectedClubId) ?? null,
    [officerClubs, selectedClubId]
  );

  const handleImageSelection = (file: File | null) => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    if (!file) {
      setSelectedImage(null);
      setImagePreviewUrl(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSelectedImage(null);
      setImagePreviewUrl(null);
      setError("Please upload an image file like JPG, PNG, or WEBP.");
      return;
    }

    if (file.size > MAX_ANNOUNCEMENT_IMAGE_SIZE) {
      setSelectedImage(null);
      setImagePreviewUrl(null);
      setError("Please keep announcement images under 8 MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedImage(file);
    setImagePreviewUrl(previewUrl);
    setError(null);
  };

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handlePublish = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedClubId || !title.trim() || !message.trim()) {
      setError("Choose a club and complete the title and message.");
      return;
    }

    setPublishing(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    let uploadedImageUrl: string | null = null;

    if (selectedImage) {
      const fileExtension = selectedImage.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeExtension = fileExtension.replace(/[^a-z0-9]/g, "") || "jpg";
      const filePath = `announcements/${selectedClubId}/${user.id}-${Date.now()}.${safeExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("clubconnect-assets")
        .upload(filePath, selectedImage, {
          cacheControl: "3600",
          contentType: selectedImage.type || undefined,
          upsert: false,
        });

      if (uploadError) {
        setError(uploadError.message || "We couldn't upload that image right now. Please try a different file.");
        setPublishing(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("clubconnect-assets").getPublicUrl(filePath);

      uploadedImageUrl = publicUrl;
    }

    const { error: insertError } = await supabase.from("posts").insert({
      club_id: selectedClubId,
      author_id: user.id,
      content: joinAnnouncementContent(title, message),
      image_url: uploadedImageUrl,
    });

    if (insertError) {
      setError("We couldn't publish that announcement right now. Please try again.");
      setPublishing(false);
      return;
    }

    router.push(getClubPath(selectedClubId));
    router.refresh();
  };

  if (loading) {
    return (
      <div className="rounded-[28px] border border-gray-200 bg-white p-8 shadow-[0_22px_70px_-48px_rgba(17,24,39,0.22)]">
        <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
          <LoaderCircle size={18} className="animate-spin text-[#51237f]" />
          Loading your club access...
        </div>
      </div>
    );
  }

  if (!officerClubs.length) {
    return (
      <div className="rounded-[28px] border border-gray-200 bg-white p-8 shadow-[0_22px_70px_-48px_rgba(17,24,39,0.22)]">
        <h1 className="text-2xl font-black tracking-[-0.03em] text-gray-950">No club access found</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">
          You need officer or admin access to publish announcements into a club feed.
        </p>
        <Link
          href="/manage"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full border border-gray-300 px-5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
        >
          Back to Manage
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_22px_70px_-48px_rgba(17,24,39,0.22)] md:p-8">
      <div className="flex flex-col gap-3 border-b border-gray-200 pb-6">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f4ecfb] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#51237f]">
          <Megaphone size={13} />
          Club Announcement
        </span>
        <h1 className="text-3xl font-black tracking-[-0.03em] text-gray-950">Send an update to your club</h1>
        <p className="max-w-3xl text-sm leading-7 text-gray-600">
          Publish an update directly into your club feed so members see it on the club page and homepage movement stream.
        </p>
      </div>

      <form onSubmit={handlePublish} className="mt-6 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-gray-800">Club audience</span>
            <select
              value={selectedClubId}
              onChange={(event) => setSelectedClubId(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-[#51237f]"
            >
              {officerClubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name} · {club.roleLabel}
                </option>
              ))}
            </select>
          </label>

          <div className="block">
            <span className="text-sm font-semibold text-gray-800">Announcement image</span>
            <label className="mt-2 flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 transition hover:border-[#51237f] hover:bg-[#faf7fd]">
              <span className="inline-flex items-center gap-2">
                <ImagePlus size={16} className="text-[#51237f]" />
                {selectedImage ? selectedImage.name : "Upload an image"}
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
            <p className="mt-2 text-xs text-gray-500">Add a cover image so the announcement looks right in the club feed.</p>
          </div>
        </div>

        {imagePreviewUrl ? (
          <div className="rounded-[24px] border border-gray-200 bg-[#fafafa] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Image preview</p>
                <p className="text-xs text-gray-500">This will be attached to the announcement post.</p>
              </div>
              <button
                type="button"
                onClick={() => handleImageSelection(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 transition hover:bg-gray-50"
                aria-label="Remove uploaded image"
              >
                <X size={15} />
              </button>
            </div>
            <div className="relative h-52 overflow-hidden rounded-[20px] border border-gray-200 bg-white">
              <Image src={imagePreviewUrl} alt="Announcement preview" fill className="object-cover" unoptimized />
            </div>
          </div>
        ) : null}

        <label className="block">
          <span className="text-sm font-semibold text-gray-800">Announcement title</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Board elections open next week"
            className="mt-2 h-12 w-full rounded-2xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-[#51237f]"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-gray-800">Message</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Share the update, deadline, or note you want club members to see."
            rows={7}
            className="mt-2 w-full rounded-[24px] border border-gray-300 bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition focus:border-[#51237f]"
          />
        </label>

        {selectedClub ? (
          <div className="rounded-[22px] border border-gray-200 bg-[#fafafa] px-4 py-4 text-sm text-gray-600">
            This will publish into <span className="font-semibold text-gray-900">{selectedClub.name}</span> and appear in that club’s feed.
          </div>
        ) : null}

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={publishing}
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#51237f] px-5 text-sm font-semibold text-white transition hover:bg-[#45206b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {publishing ? (
              <span className="inline-flex items-center gap-2">
                <LoaderCircle size={16} className="animate-spin" />
                Publishing...
              </span>
            ) : (
              "Publish announcement"
            )}
          </button>
          <Link
            href={selectedClub ? getClubPath(selectedClub.id) : "/manage"}
            className="inline-flex h-12 items-center justify-center rounded-full border border-gray-300 px-5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
