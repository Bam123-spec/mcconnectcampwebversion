"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, LoaderCircle, MapPin, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";

type ClubProfile = {
  id: string;
  name: string;
  description: string;
  coverImageUrl: string | null;
  memberCount: number;
  slug: string;
  category: string;
};

type ClubEvent = {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
};

type ClubMember = {
  id: string;
  name: string;
  joinedAt: string | null;
  roleLabel: string;
};

type ClubFeedPost = {
  id: string;
  title: string;
  content: string;
  createdAt: string | null;
  category: string;
};

type TabKey = "feed" | "events" | "members" | "about";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "feed", label: "Feed" },
  { key: "events", label: "Events" },
  { key: "members", label: "Members" },
  { key: "about", label: "About" },
];

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

const formatJoinedDate = (value?: string | null) => {
  if (!value) return "Joined recently";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Joined recently";
  return `Joined ${parsed.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  })}`;
};

const formatPostDate = (value?: string | null) => {
  if (!value) return "Recently posted";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Recently posted";
  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const trimText = (value: string, maxLength: number) =>
  value.length > maxLength ? `${value.slice(0, maxLength).trim()}…` : value;

export function ClubProfilePanel({
  initialClub,
  initialEvents,
  officerNames,
  initialMembers,
  initialFeedPosts,
}: {
  initialClub: ClubProfile;
  initialEvents: ClubEvent[];
  officerNames: string[];
  initialMembers: ClubMember[];
  initialFeedPosts: ClubFeedPost[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("feed");
  const [isMember, setIsMember] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBusy, setIsBusy] = useState<"join" | "follow" | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadViewerState = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setIsMember(false);
          setIsFollowing(false);
        }
        return;
      }

      const [{ data: membership }, { data: following }] = await Promise.all([
        supabase
          .from("club_members")
          .select("id")
          .eq("club_id", initialClub.id)
          .eq("user_id", user.id)
          .eq("status", "approved")
          .maybeSingle(),
        supabase
          .from("club_followers")
          .select("id")
          .eq("club_id", initialClub.id)
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (!cancelled) {
        setIsMember(Boolean(membership));
        setIsFollowing(Boolean(following));
      }
    };

    loadViewerState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadViewerState();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [initialClub.id]);

  const ensureSignedIn = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return null;
    }
    return user;
  };

  const handleJoin = async () => {
    const user = await ensureSignedIn();
    if (!user) return;

    setIsBusy("join");
    setFeedback(null);
    try {
      const { error } = await supabase.from("club_members").insert({
        club_id: initialClub.id,
        user_id: user.id,
        status: "approved",
      });

      if (error) throw error;

      await supabase.from("club_followers").upsert(
        {
          club_id: initialClub.id,
          user_id: user.id,
        },
        { onConflict: "user_id, club_id", ignoreDuplicates: true }
      );

      setIsMember(true);
      setIsFollowing(true);
      setFeedback({ type: "success", message: "You joined this club successfully." });
    } catch (error) {
      console.error("Error joining club:", error);
      setFeedback({ type: "error", message: "We couldn't join this club right now. Please try again." });
    } finally {
      setIsBusy(null);
    }
  };

  const handleFollowToggle = async () => {
    const user = await ensureSignedIn();
    if (!user) return;

    setIsBusy("follow");
    setFeedback(null);
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from("club_followers")
          .delete()
          .eq("club_id", initialClub.id)
          .eq("user_id", user.id);

        if (error) throw error;
        setIsFollowing(false);
        setFeedback({ type: "success", message: "You will stop receiving updates from this club." });
      } else {
        const { error } = await supabase.from("club_followers").insert({
          club_id: initialClub.id,
          user_id: user.id,
        });

        if (error) throw error;
        setIsFollowing(true);
        setFeedback({ type: "success", message: "You're now following this club." });
      }
    } catch (error) {
      console.error("Error updating follow state:", error);
      setFeedback({ type: "error", message: "We couldn't update your follow preferences right now." });
    } finally {
      setIsBusy(null);
    }
  };

  const clubBadge = initialClub.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const feedItems = useMemo(() => {
    const postItems = initialFeedPosts.map((post) => ({
      id: `post-${post.id}`,
      type: "post" as const,
      title: post.title,
      meta: formatPostDate(post.createdAt),
      description: trimText(post.content, 180),
      actionLabel: "Read update",
      href: "/announcements",
      sortKey: post.createdAt ? new Date(post.createdAt).getTime() : 0,
    }));

    const eventItems = initialEvents.map((event) => ({
      id: `event-${event.id}`,
      type: "event" as const,
      title: event.name,
      meta: `${formatEventDate(event.date)} • ${event.time}`,
      description: event.location,
      actionLabel: "View event",
      href: "/events",
      sortKey: event.date ? new Date(event.date).getTime() : Number.MAX_SAFE_INTEGER,
    }));

    return [...eventItems, ...postItems].sort((left, right) => left.sortKey - right.sortKey);
  }, [initialEvents, initialFeedPosts]);

  const leadershipMembers = initialMembers.filter((member) => member.roleLabel === "Leadership");

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/clubs" className="text-sm font-semibold text-[#51237f] hover:underline">
            Back to clubs
          </Link>
          <span className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600">
            {initialClub.category}
          </span>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_18px_50px_-40px_rgba(17,24,39,0.25)]">
          <div className="relative h-56 w-full bg-gray-100">
            <Image
              src={initialClub.coverImageUrl || fallbackCover}
              alt={initialClub.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
          </div>

          <div className="px-6 pb-6 pt-0 md:px-8">
            <div className="relative -mt-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-end gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-[#51237f] text-2xl font-black text-white shadow-md">
                  {clubBadge}
                </div>
                <div className="pb-1">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Community Hub</p>
                  <h1 className="mt-1 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">{initialClub.name}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Users size={15} className="text-[#51237f]" />
                      {initialClub.memberCount} members
                    </span>
                    <span className="inline-flex rounded-full bg-[#f4ecfb] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#51237f]">
                      {initialClub.category}
                    </span>
                    {isMember ? (
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                        Joined
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleJoin}
                  disabled={isMember || isBusy === "join"}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[#51237f] px-5 text-sm font-semibold text-white transition hover:bg-[#45206b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isBusy === "join" ? (
                    <span className="inline-flex items-center gap-2">
                      <LoaderCircle size={14} className="animate-spin" />
                      Joining...
                    </span>
                  ) : isMember ? (
                    "Joined Club"
                  ) : (
                    "Join Club"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleFollowToggle}
                  disabled={isBusy === "follow"}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isBusy === "follow" ? (
                    <span className="inline-flex items-center gap-2">
                      <LoaderCircle size={14} className="animate-spin" />
                      Updating...
                    </span>
                  ) : isFollowing ? (
                    "Following"
                  ) : (
                    "Follow updates"
                  )}
                </button>
              </div>
            </div>

            {feedback ? (
              <div
                aria-live={feedback.type === "error" ? "assertive" : "polite"}
                className={`mt-5 rounded-xl px-4 py-3 text-sm font-medium ${
                  feedback.type === "success"
                    ? "border border-green-200 bg-green-50 text-green-700"
                    : "border border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {feedback.message}
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex h-11 items-center rounded-t-2xl px-4 text-sm font-semibold transition ${
                    isActive
                      ? "border border-b-white border-gray-200 bg-white text-[#51237f]"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="py-8">
          {activeTab === "feed" ? (
            <div className="space-y-4">
              {feedItems.length ? (
                feedItems.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-[22px] border border-gray-200 bg-white p-5 shadow-[0_12px_28px_-24px_rgba(17,24,39,0.22)]"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                              item.type === "event" ? "bg-[#f4ecfb] text-[#51237f]" : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {item.type === "event" ? "Upcoming event" : "Announcement"}
                          </span>
                        </div>
                        <h2 className="mt-3 text-xl font-bold leading-tight text-gray-950">{item.title}</h2>
                        <p className="mt-3 text-sm font-medium text-gray-500">{item.meta}</p>
                        <p className="mt-4 text-sm leading-6 text-gray-600">{item.description}</p>
                      </div>
                      <Link
                        href={item.href}
                        className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#51237f] px-5 text-sm font-semibold text-white transition hover:bg-[#45206b]"
                      >
                        {item.actionLabel}
                      </Link>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-sm text-gray-500">
                  This club hasn&apos;t posted any updates yet.
                </div>
              )}
            </div>
          ) : null}

          {activeTab === "events" ? (
            <div className="space-y-4">
              {initialEvents.length ? (
                initialEvents.map((event) => (
                  <article
                    key={event.id}
                    className="rounded-[22px] border border-gray-200 bg-white p-5 shadow-[0_12px_28px_-24px_rgba(17,24,39,0.22)]"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-gray-950">{event.name}</h2>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays size={15} className="text-gray-400" />
                            {formatEventDate(event.date)} • {event.time}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <MapPin size={15} className="text-gray-400" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                      <Link
                        href="/events"
                        className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        View event
                      </Link>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-sm text-gray-500">
                  No upcoming club events are listed yet.
                </div>
              )}
            </div>
          ) : null}

          {activeTab === "members" ? (
            <div className="grid gap-4 md:grid-cols-2">
              {initialMembers.length ? (
                initialMembers.map((member) => (
                  <article
                    key={member.id}
                    className="rounded-[22px] border border-gray-200 bg-white p-5 shadow-[0_12px_28px_-24px_rgba(17,24,39,0.22)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-base font-bold text-gray-950">{member.name}</h2>
                        <p className="mt-2 text-sm text-gray-500">{formatJoinedDate(member.joinedAt)}</p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                          member.roleLabel === "Leadership"
                            ? "bg-[#f4ecfb] text-[#51237f]"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {member.roleLabel}
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-sm text-gray-500 md:col-span-2">
                  Member details are not published for this club yet.
                </div>
              )}
            </div>
          ) : null}

          {activeTab === "about" ? (
            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <section className="rounded-[22px] border border-gray-200 bg-white p-6 shadow-[0_12px_28px_-24px_rgba(17,24,39,0.22)]">
                <h2 className="text-lg font-bold text-gray-950">About this club</h2>
                <p className="mt-4 text-sm leading-7 text-gray-600">
                  {initialClub.description || "This club has not added a public description yet."}
                </p>
              </section>

              <section className="rounded-[22px] border border-gray-200 bg-white p-6 shadow-[0_12px_28px_-24px_rgba(17,24,39,0.22)]">
                <h2 className="text-lg font-bold text-gray-950">Leadership</h2>
                <div className="mt-4 space-y-3">
                  {officerNames.length ? (
                    officerNames.map((officer) => (
                      <div key={officer} className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700">
                        {officer}
                      </div>
                    ))
                  ) : leadershipMembers.length ? (
                    leadershipMembers.map((member) => (
                      <div key={member.id} className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700">
                        {member.name}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                      No officer roles are published for this club yet.
                    </div>
                  )}
                </div>
              </section>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
