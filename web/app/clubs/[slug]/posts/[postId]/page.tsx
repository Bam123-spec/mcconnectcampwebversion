import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarDays, ChevronLeft, Megaphone } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase";
import { slugifyClubName } from "@/lib/club-utils";

type ClubRow = {
  id: string;
  name?: string | null;
  description?: string | null;
};

type PostRow = {
  id: string;
  club_id?: string | null;
  content?: string | null;
  image_url?: string | null;
  created_at?: string | null;
  profiles?:
    | {
        full_name?: string | null;
      }
    | {
        full_name?: string | null;
      }[]
    | null;
};

const fallbackCover =
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1600&auto=format&fit=crop";

const getAuthorName = (value: PostRow["profiles"]) => {
  if (Array.isArray(value)) return value[0]?.full_name || "Club leadership";
  return value?.full_name || "Club leadership";
};

const derivePostTitle = (value?: string | null) => {
  const content = (value || "").trim();
  if (!content) return "Club update";

  const firstSentence = content.split(/[.!?]/)[0]?.trim() || content;
  return firstSentence.length > 88 ? `${firstSentence.slice(0, 85).trim()}…` : firstSentence;
};

const formatPostDate = (value?: string | null) => {
  if (!value) return "Recently posted";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Recently posted";
  return parsed.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const getClubBySlug = async (slug: string) => {
  const supabase = createServerSupabaseClient();
  const { data: directClub } = await supabase
    .from("clubs")
    .select("id, name, description")
    .eq("id", slug)
    .maybeSingle();

  if (directClub?.id) return directClub as ClubRow;

  const { data: clubs } = await supabase
    .from("clubs")
    .select("id, name, description")
    .order("name", { ascending: true });

  return (((clubs ?? []) as ClubRow[]).find((club) => slugifyClubName(club.name || "") === slug) ?? null) as ClubRow | null;
};

const getClubPost = async (clubId: string, postId: string) => {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("posts")
    .select("id, club_id, content, image_url, created_at, profiles:author_id(full_name)")
    .eq("club_id", clubId)
    .eq("id", postId)
    .maybeSingle();

  return (data as PostRow | null) ?? null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; postId: string }>;
}): Promise<Metadata> {
  const { slug, postId } = await params;
  const club = await getClubBySlug(slug);
  if (!club?.id) {
    return { title: "Post Not Found | Raptor Connect" };
  }

  const post = await getClubPost(club.id, postId);
  if (!post) {
    return { title: "Post Not Found | Raptor Connect" };
  }

  return {
    title: `${derivePostTitle(post.content)} | ${club.name || "Club"} | Raptor Connect`,
    description: (post.content || "Club update").slice(0, 160),
  };
}

export default async function ClubPostPage({
  params,
}: {
  params: Promise<{ slug: string; postId: string }>;
}) {
  const { slug, postId } = await params;
  const club = await getClubBySlug(slug);

  if (!club?.id) {
    notFound();
  }

  const post = await getClubPost(club.id, postId);

  if (!post) {
    notFound();
  }

  const postTitle = derivePostTitle(post.content);
  const authorName = getAuthorName(post.profiles);
  const postDate = formatPostDate(post.created_at);

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href={`/clubs/${slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#51237f] transition hover:text-[#45206b]"
          >
            <ChevronLeft size={16} />
            Back to {club.name}
          </Link>
        </div>

        <article className="overflow-hidden rounded-[30px] border border-gray-200 bg-white shadow-[0_24px_70px_-48px_rgba(17,24,39,0.24)]">
          <div className="relative h-64 w-full bg-gray-100">
            <Image
              src={post.image_url || fallbackCover}
              alt={postTitle}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
            <div className="absolute left-6 top-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#51237f] backdrop-blur-sm">
                <Megaphone size={13} />
                Club Post
              </span>
            </div>
          </div>

          <div className="px-6 py-8 md:px-8">
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="rounded-full bg-[#f4ecfb] px-3 py-1.5 text-xs font-semibold text-[#51237f]">
                {club.name}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={15} className="text-gray-400" />
                {postDate}
              </span>
              <span>{authorName}</span>
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-[-0.04em] text-gray-950">{postTitle}</h1>

            <div className="mt-6 rounded-[24px] border border-gray-200 bg-[#fafafa] px-5 py-5">
              <div className="whitespace-pre-wrap text-[15px] leading-8 text-gray-700">
                {post.content || "A club update is available."}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/clubs/${slug}`}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#51237f] px-5 text-sm font-semibold text-white transition hover:bg-[#45206b]"
              >
                Return to club
              </Link>
              <Link
                href="/clubs"
                className="inline-flex h-11 items-center justify-center rounded-full border border-gray-300 px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Browse clubs
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
