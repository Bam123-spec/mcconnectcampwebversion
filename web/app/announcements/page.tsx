import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase";

type AnnouncementRow = {
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

const getAuthorName = (value: AnnouncementRow["author"]) => {
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

const getPreview = (value?: string | null) => {
  if (!value) return "Campus update available.";
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= 180) return normalized;
  return `${normalized.slice(0, 177)}...`;
};

export const metadata = {
  title: "Campus Announcements | Raptor Connect",
  description: "Recent announcements and updates across Montgomery College.",
};

export default async function AnnouncementsPage() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("forum_posts")
    .select("id, title, content, created_at, category, author:author_id(full_name)")
    .eq("category", "announcements")
    .order("created_at", { ascending: false })
    .limit(30);

  const announcements = ((data ?? []) as AnnouncementRow[]).map((announcement) => ({
    id: announcement.id,
    title: announcement.title || "Campus announcement",
    preview: getPreview(announcement.content),
    dateLabel: formatAnnouncementDate(announcement.created_at),
    authorName: getAuthorName(announcement.author),
  }));

  return (
    <div className="bg-[#f5f6f8] min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#51237f]">Montgomery College</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-900">Campus Announcements</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-gray-600">
            Review official updates, event notices, and community-wide posts that have been published into the Raptor Connect announcement feed.
          </p>
        </div>

        <div className="space-y-4">
          {announcements.length ? (
            announcements.map((announcement) => (
              <article
                key={announcement.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#51237f]">Announcement</p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                      {announcement.title}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-gray-600">{announcement.preview}</p>
                    <p className="mt-4 text-sm text-gray-500">
                      {announcement.dateLabel} · {announcement.authorName}
                    </p>
                  </div>
                  <Link
                    href={`/announcements/${announcement.id}`}
                    className="inline-flex shrink-0 items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#51237f] hover:text-[#51237f]"
                  >
                    Read update
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-sm text-gray-500">
              No announcement posts are available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
