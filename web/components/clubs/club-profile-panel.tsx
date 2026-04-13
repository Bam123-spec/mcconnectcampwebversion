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
  rsvpCount: number;
};

type ClubMember = {
  id: string;
  name: string;
  joinedAt: string | null;
  roleLabel: string;
  avatarUrl?: string | null;
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
  value.length > maxLength ? `${value.slice(0, maxLength).trim()}...` : value;

const getInitials = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const statLabel = (value: number, singular: string, plural: string) => `${value} ${value === 1 ? singular : plural}`;

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

  const clubBadge = getInitials(initialClub.name);
  const clubSummary = initialClub.description?.trim()
    ? trimText(initialClub.description.trim(), 230)
    : `${initialClub.name} brings students together through community, campus events, and shared interests.`;
  const memberPreview = initialMembers.slice(0, 5);
  const extraMemberCount = Math.max(0, initialClub.memberCount - memberPreview.length);
  const featuredEvent = initialEvents[0] ?? null;
  const leadershipMembers = initialMembers.filter((member) => member.roleLabel === "Leadership");
  const leadershipCount = Math.max(officerNames.length, leadershipMembers.length);
  const now = Date.now();
  const weekAhead = now + 7 * 24 * 60 * 60 * 1000;
  const weekBack = now - 7 * 24 * 60 * 60 * 1000;
  const eventsThisWeek = initialEvents.filter((event) => {
    const parsed = Date.parse(event.date);
    return !Number.isNaN(parsed) && parsed >= now && parsed <= weekAhead;
  }).length;
  const updatesThisWeek = initialFeedPosts.filter((post) => {
    if (!post.createdAt) return false;
    const parsed = Date.parse(post.createdAt);
    return !Number.isNaN(parsed) && parsed >= weekBack;
  }).length;
  const activityLabel =
    eventsThisWeek > 0
      ? statLabel(eventsThisWeek, "event this week", "events this week")
      : updatesThisWeek > 0
        ? statLabel(updatesThisWeek, "update this week", "updates this week")
        : "activity starting soon";

  const postItems = useMemo(() => {
    return initialFeedPosts.map((post) => ({
      id: `post-${post.id}`,
      title: post.title,
      meta: formatPostDate(post.createdAt),
      description: trimText(post.content, 220),
      href: `/clubs/${initialClub.slug}/posts/${post.id}`,
    }));
  }, [initialClub.slug, initialFeedPosts]);

  return (
    <main className="min-h-screen bg-white text-[#17151c]">
      <div className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/clubs" className="text-sm font-semibold text-[#51237f] hover:underline">
            Back to clubs
          </Link>
          <span className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600">
            {initialClub.category}
          </span>
        </div>

        <section className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="pt-2">
            <div className="mb-5 flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#51237f] text-sm font-black text-white">
                {clubBadge}
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#51237f]">Club profile</p>
                <p className="text-sm text-gray-500">{activityLabel}</p>
              </div>
            </div>

            <h1 className="max-w-4xl text-[3.6rem] font-black leading-[0.9] tracking-[-0.075em] text-[#121016] md:text-[5.5rem]">
              {initialClub.name}
            </h1>

            <p className="mt-6 max-w-2xl text-[17px] leading-8 text-gray-600">{clubSummary}</p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <div className="flex -space-x-3">
                {memberPreview.map((member) => (
                  <div
                    key={member.id}
                    className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-white bg-[#f2ecf8] shadow-sm transition duration-200 hover:z-10 hover:scale-105"
                    title={member.name}
                  >
                    {member.avatarUrl ? (
                      <Image src={member.avatarUrl} alt={member.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[#51237f]">
                        {getInitials(member.name)}
                      </div>
                    )}
                  </div>
                ))}
                {extraMemberCount > 0 ? (
                  <div className="relative flex h-11 min-w-11 items-center justify-center rounded-full border-2 border-white bg-[#17151c] px-2 text-[11px] font-bold text-white shadow-sm transition duration-200 hover:z-10 hover:scale-105">
                    +{extraMemberCount}
                  </div>
                ) : null}
              </div>
              <p className="text-sm font-semibold text-gray-700">
                {initialClub.memberCount} members <span className="mx-2 text-gray-300">/</span> {initialEvents.length} upcoming events
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleJoin}
                disabled={isMember || isBusy === "join"}
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#51237f] px-7 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#432066] hover:shadow-[0_16px_34px_-22px_rgba(81,35,127,0.65)] disabled:cursor-not-allowed disabled:opacity-60"
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
                className="inline-flex h-12 items-center justify-center rounded-full border border-gray-200 bg-white px-7 text-sm font-bold text-gray-800 transition duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-[0_14px_30px_-24px_rgba(17,24,39,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
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

          <div className="space-y-4">
            <div className="relative aspect-[4/4.45] overflow-hidden rounded-[34px] bg-gray-100 shadow-[0_28px_70px_-44px_rgba(17,24,39,0.45)]">
              <Image src={initialClub.coverImageUrl || fallbackCover} alt={initialClub.name} fill className="object-cover" priority />
              <div className="absolute inset-x-4 bottom-4 rounded-[26px] bg-white p-4 shadow-[0_18px_42px_-30px_rgba(17,24,39,0.4)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#51237f]">Up next</p>
                {featuredEvent ? (
                  <>
                    <h2 className="mt-2 text-xl font-black leading-tight tracking-[-0.04em]">{featuredEvent.name}</h2>
                    <div className="mt-3 space-y-2 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <CalendarDays size={15} className="text-gray-400" />
                        {formatEventDate(featuredEvent.date)} / {featuredEvent.time}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin size={15} className="text-gray-400" />
                        {featuredEvent.location}
                      </p>
                    </div>
                    <Link href={`/events/${featuredEvent.id}`} className="mt-4 inline-flex text-sm font-bold text-[#51237f] hover:underline">
                      View event
                    </Link>
                  </>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-gray-600">No upcoming event is published yet.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-[28px] border border-gray-100 bg-[#fafafa] p-3">
              {[
                ["Members", initialClub.memberCount],
                ["Events", initialEvents.length],
                ["Leads", leadershipCount],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[22px] bg-white px-3 py-4 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">{label}</p>
                  <p className="mt-1 text-2xl font-black">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {feedback ? (
          <div
            aria-live={feedback.type === "error" ? "assertive" : "polite"}
            className={`mt-8 rounded-2xl px-4 py-3 text-sm font-medium ${
              feedback.type === "success"
                ? "border border-green-200 bg-green-50 text-green-700"
                : "border border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        <section className="mt-14 border-y border-gray-100 py-3">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`h-11 rounded-full px-5 text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-[#17151c] text-white shadow-[0_14px_28px_-22px_rgba(17,24,39,0.45)]"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div>
            {activeTab === "feed" ? (
              <div className="space-y-4">
                {postItems.length ? (
                  postItems.map((item) => (
                    <article key={item.id} className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-[0_20px_44px_-36px_rgba(17,24,39,0.26)] transition duration-200 hover:-translate-y-0.5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f2ecf8] text-xs font-black text-[#51237f]">
                          {clubBadge}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-500">{item.meta}</p>
                          <h2 className="mt-2 text-2xl font-black leading-tight tracking-[-0.04em]">{item.title}</h2>
                          <p className="mt-3 text-sm leading-7 text-gray-600">{item.description}</p>
                          <Link href={item.href} className="mt-4 inline-flex text-sm font-bold text-[#51237f] hover:underline">
                            Read update
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[28px] border border-dashed border-gray-200 bg-white px-6 py-14 text-center text-sm text-gray-500">
                    This club has not posted any updates yet.
                  </div>
                )}
              </div>
            ) : null}

            {activeTab === "events" ? (
              <div className="space-y-4">
                {initialEvents.length ? (
                  initialEvents.map((event) => (
                    <article key={event.id} className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-[0_20px_44px_-36px_rgba(17,24,39,0.26)] transition duration-200 hover:-translate-y-0.5">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h2 className="text-2xl font-black tracking-[-0.04em]">{event.name}</h2>
                          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-2">
                              <CalendarDays size={15} className="text-gray-400" />
                              {formatEventDate(event.date)} / {event.time}
                            </span>
                            <span className="flex items-center gap-2">
                              <MapPin size={15} className="text-gray-400" />
                              {event.location}
                            </span>
                            <span className="flex items-center gap-2">
                              <Users size={15} className="text-gray-400" />
                              {event.rsvpCount} going
                            </span>
                          </div>
                        </div>
                        <Link href={`/events/${event.id}`} className="inline-flex h-11 items-center justify-center rounded-full border border-gray-200 px-5 text-sm font-bold hover:bg-gray-50">
                          View event
                        </Link>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[28px] border border-dashed border-gray-200 bg-white px-6 py-14 text-center text-sm text-gray-500">
                    No upcoming club events are listed yet.
                  </div>
                )}
              </div>
            ) : null}

            {activeTab === "members" ? (
              <div className="grid gap-4 md:grid-cols-2">
                {initialMembers.length ? (
                  initialMembers.map((member) => (
                    <article key={member.id} className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-[0_20px_44px_-36px_rgba(17,24,39,0.26)] transition duration-200 hover:-translate-y-0.5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-[#f2ecf8]">
                            {member.avatarUrl ? (
                              <Image src={member.avatarUrl} alt={member.name} fill className="object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[#51237f]">
                                {getInitials(member.name)}
                              </div>
                            )}
                          </div>
                          <div>
                            <h2 className="font-black">{member.name}</h2>
                            <p className="mt-1 text-sm text-gray-500">{formatJoinedDate(member.joinedAt)}</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-gray-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
                          {member.roleLabel}
                        </span>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[28px] border border-dashed border-gray-200 bg-white px-6 py-14 text-center text-sm text-gray-500 md:col-span-2">
                    Member details are not published for this club yet.
                  </div>
                )}
              </div>
            ) : null}

            {activeTab === "about" ? (
              <article className="rounded-[28px] border border-gray-100 bg-white p-7 shadow-[0_20px_44px_-36px_rgba(17,24,39,0.26)]">
                <h2 className="text-2xl font-black tracking-[-0.04em]">About {initialClub.name}</h2>
                <p className="mt-4 text-sm leading-8 text-gray-600">
                  {initialClub.description || "This club has not added a public description yet."}
                </p>
              </article>
            ) : null}
          </div>

          <aside className="space-y-4">
            <section className="rounded-[28px] border border-gray-100 bg-[#fafafa] p-5">
              <h2 className="text-sm font-black uppercase tracking-[0.16em] text-gray-500">Leadership</h2>
              <div className="mt-4 space-y-2">
                {(officerNames.length ? officerNames : leadershipMembers.map((member) => member.name)).slice(0, 4).map((officer) => (
                  <div key={officer} className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-gray-700">
                    {officer}
                  </div>
                ))}
                {!officerNames.length && !leadershipMembers.length ? (
                  <p className="rounded-2xl bg-white px-4 py-5 text-sm text-gray-500">Leadership details are not published yet.</p>
                ) : null}
              </div>
            </section>

            <section className="rounded-[28px] border border-gray-100 bg-[#fafafa] p-5">
              <h2 className="text-sm font-black uppercase tracking-[0.16em] text-gray-500">Club rhythm</h2>
              <div className="mt-4 space-y-3 text-sm font-semibold text-gray-700">
                <p className="rounded-2xl bg-white px-4 py-3">{activityLabel}</p>
                <p className="rounded-2xl bg-white px-4 py-3">{statLabel(initialFeedPosts.length, "recent update", "recent updates")}</p>
                <p className="rounded-2xl bg-white px-4 py-3">{statLabel(initialEvents.length, "upcoming event", "upcoming events")}</p>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
