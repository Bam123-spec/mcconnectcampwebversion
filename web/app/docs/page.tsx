import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChevronRightIcon,
  CircleHelp,
  FileWarning,
  LockKeyhole,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

const QUICK_ACTIONS = [
  {
    title: "Account access",
    description: "Get help signing in, understanding your campus account, or finding the right login path.",
    href: "/login",
    icon: ShieldCheck,
  },
  {
    title: "Event guidance",
    description: "Learn how RSVPs work, what event statuses mean, and where to reopen event details.",
    href: "/docs/events",
    icon: BookOpen,
  },
  {
    title: "Privacy and security",
    description: "Review what is public, what is protected, and what appears only after authentication.",
    href: "/docs/privacy",
    icon: LockKeyhole,
  },
  {
    title: "Platform navigation",
    description: "Understand where to go for clubs, events, activity, and support without guesswork.",
    href: "/docs/navigating",
    icon: CircleHelp,
  },
];

const CONTACT_PATHS = [
  {
    title: "Raptor Central",
    description: "Best for admissions, financial aid, records, billing, and student services questions.",
    href: "https://www.montgomerycollege.edu/welcomecenter",
  },
  {
    title: "Blackboard Support",
    description: "Best for course access, learning tools, assignments, and related online class issues.",
    href: "https://info.montgomerycollege.edu/offices/information-technology/blackboard-support.html",
  },
  {
    title: "MyMC Portal",
    description: "Best when you need to reopen official campus services, records, or other linked systems.",
    href: "https://mymc.montgomerycollege.edu/",
  },
];

const COMMON_TASKS = [
  {
    id: "account-access",
    title: "I cannot sign in or my account looks wrong",
    body: "Start by confirming you are using the same campus account connected to your Montgomery College profile. If the issue is broader than Raptor Connect access, use the official MyMC and student services channels.",
    actionLabel: "Open login",
    actionHref: "/login",
  },
  {
    id: "event-help",
    title: "I need help with an RSVP or event details",
    body: "Open the event page first to confirm the date, location, and current RSVP state. If the event requires organizer follow-up or approval, the event detail page is the right place to start.",
    actionLabel: "Read event help",
    actionHref: "/docs/events",
  },
  {
    id: "club-help",
    title: "I want to find a club or check a membership",
    body: "Use the clubs directory to search by category, campus, or meeting day. If you have already joined a group, your activity page will help you reopen the organizations tied to your account.",
    actionLabel: "Open clubs",
    actionHref: "/clubs",
  },
  {
    id: "report-issue",
    title: "I found a problem and need to report it clearly",
    body: "When reporting an issue, include the page you were on, what you expected to happen, and what happened instead. If the problem involves another campus system, use the official support route for that service.",
    actionLabel: "Review support paths",
    actionHref: "#contact-routes",
  },
];

export default function DocsPage() {
  return (
    <>
      <nav className="mb-8 flex items-center text-sm font-medium text-gray-500">
        <Link
          href="/"
          className="rounded-md transition-colors hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
        >
          Home
        </Link>
        <ChevronRightIcon size={14} className="mx-2" />
        <span>Support</span>
        <ChevronRightIcon size={14} className="mx-2" />
        <span className="font-semibold text-[var(--primary)]">Help Center</span>
      </nav>

      <div className="space-y-10">
        <section className="overflow-hidden rounded-[30px] border border-[var(--line-soft)] bg-[#1f1830] text-white shadow-[0_16px_48px_rgba(15,23,42,0.12)]">
          <div className="relative">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(81,35,127,0.94),rgba(17,24,39,0.9))]" />
            <div className="relative px-7 py-8 sm:px-9 sm:py-10">
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/88">
                Support and Help
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Clear answers, calm guidance, and the right support path.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/84">
                Use this page to understand how Raptor Connect works, find the right campus support route,
                and resolve common student questions without having to guess where to go next.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/12 bg-white/8 px-4 py-4 backdrop-blur-sm">
                  <div className="text-2xl font-semibold text-white">4</div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-white/68">
                    Quick help paths
                  </div>
                </div>
                <div className="rounded-2xl border border-white/12 bg-white/8 px-4 py-4 backdrop-blur-sm">
                  <div className="text-2xl font-semibold text-white">3</div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-white/68">
                    Official support routes
                  </div>
                </div>
                <div className="rounded-2xl border border-white/12 bg-white/8 px-4 py-4 backdrop-blur-sm">
                  <div className="text-2xl font-semibold text-white">1</div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-white/68">
                    Trusted help hub
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_340px]">
          <div className="ui-surface p-6 sm:p-8">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
                Start here
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">
                Most common student help needs
              </h2>
              <p className="mt-3 text-sm leading-7 text-gray-600 sm:text-base">
                These are the questions students usually need answered first. Start with the task
                that matches what you are trying to solve right now.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="group rounded-2xl border border-[var(--line-soft)] bg-white p-5 shadow-[var(--shadow-soft)] transition hover:border-[rgba(71,10,104,0.25)] hover:bg-[rgba(71,10,104,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="rounded-xl bg-[rgba(71,10,104,0.08)] p-3 text-[var(--primary)]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 transition group-hover:text-[var(--primary)]" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-950">{action.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-gray-600">{action.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>

          <aside className="ui-muted-panel p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
                  Guidance
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                  Before you contact support
                </h2>
              </div>
              <FileWarning className="h-5 w-5 text-[var(--primary)]" />
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-[var(--line-soft)] bg-white p-4">
                <div className="text-sm font-semibold text-gray-950">Check the page first</div>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Event and club pages usually contain the date, location, status, or meeting information you need.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--line-soft)] bg-white p-4">
                <div className="text-sm font-semibold text-gray-950">Use the right office</div>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Raptor Connect helps with campus engagement, but account, coursework, and records issues may belong to another MC service.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--line-soft)] bg-white p-4">
                <div className="text-sm font-semibold text-gray-950">Report clearly</div>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Include the page, the action you took, and what looked wrong so the next step is obvious.
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="ui-surface overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
              Common tasks
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">
              Answers organized by what students are trying to do
            </h2>
          </div>

          <div className="grid gap-0 md:grid-cols-2">
            {COMMON_TASKS.map((task) => (
              <section
                key={task.id}
                id={task.id}
                className="border-b border-gray-100 px-6 py-6 last:border-b-0 md:border-r md:[&:nth-child(2n)]:border-r-0"
              >
                <h3 className="text-xl font-semibold text-gray-950">{task.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">{task.body}</p>
                <Link
                  href={task.actionHref}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-[rgba(71,10,104,0.30)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                >
                  {task.actionLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </section>
            ))}
          </div>
        </section>

        <section id="contact-routes" className="ui-surface overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
              Contact routes
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">
              Official places to get the right kind of help
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600">
              These routes are better than a generic contact button because they map the problem to
              the office or service most likely to resolve it.
            </p>
          </div>

          <div className="grid gap-0 md:grid-cols-3">
            {CONTACT_PATHS.map((path) => (
              <a
                key={path.title}
                href={path.href}
                target="_blank"
                rel="noreferrer"
                className="group border-b border-gray-100 px-6 py-6 transition hover:bg-[rgba(71,10,104,0.04)] md:border-b-0 md:border-r last:border-r-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-inset"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-xl bg-[rgba(71,10,104,0.08)] p-3 text-[var(--primary)]">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 transition group-hover:text-[var(--primary)]" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-950">{path.title}</h3>
                <p className="mt-2 text-sm leading-7 text-gray-600">{path.description}</p>
              </a>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
