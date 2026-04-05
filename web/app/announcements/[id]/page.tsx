import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";

type AnnouncementDetailRow = {
  id: string;
  title?: string | null;
  content?: string | null;
  created_at?: string | null;
  category?: string | null;
  author?:
    | {
        full_name?: string | null;
      }
    | {
        full_name?: string | null;
      }[]
    | null;
};

const getAuthorName = (value: AnnouncementDetailRow["author"]) => {
  if (Array.isArray(value)) return value[0]?.full_name || "Montgomery College";
  return value?.full_name || "Montgomery College";
};

const formatAnnouncementDate = (value?: string | null) => {
  if (!value) return "Recently posted";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Recently posted";
  return parsed.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getAnnouncement = async (id: string) => {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("forum_posts")
    .select("id, title, content, created_at, category, author:author_id(full_name)")
    .eq("id", id)
    .eq("category", "announcements")
    .maybeSingle();

  return data as AnnouncementDetailRow | null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const announcement = await getAnnouncement(id);

  if (!announcement) {
    return {
      title: "Announcement Not Found | Raptor Connect",
    };
  }

  return {
    title: `${announcement.title || "Announcement"} | Raptor Connect`,
    description: announcement.content?.slice(0, 160) || "Campus announcement",
  };
}

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const announcement = await getAnnouncement(id);

  if (!announcement) {
    notFound();
  }

  return (
    <div className="bg-[#f5f6f8] min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/announcements" className="text-sm font-semibold text-[#51237f] hover:underline">
            Back to announcements
          </Link>
        </div>

        <article className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#51237f]">Announcement</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-900">
            {announcement.title || "Campus announcement"}
          </h1>
          <p className="mt-4 text-sm text-gray-500">
            {formatAnnouncementDate(announcement.created_at)} · {getAuthorName(announcement.author)}
          </p>

          <div className="mt-8 border-t border-gray-100 pt-8">
            <div className="whitespace-pre-wrap text-base leading-8 text-gray-700">
              {announcement.content || "No additional content was provided for this announcement."}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
