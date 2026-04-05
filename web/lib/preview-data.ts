import type { WebEventCardEvent } from "@/components/events/EventCard";
import { slugifyClubName } from "@/lib/club-utils";

export type PreviewClub = {
  id: string;
  name: string;
  description: string;
  members: number;
  campus: string;
  category: string;
  initials: string;
  color: string;
  coverImageUrl: string | null;
};

export type PreviewActivityRegistration = {
  id: string;
  eventName: string;
  clubName: string;
  dateLabel: string;
  location: string;
  status: "Confirmed";
  isUpcoming: boolean;
};

export type PreviewActivityMembership = {
  id: string;
  name: string;
  role: string;
  joinedLabel: string;
  initials: string;
  badgeTone: "officer" | "member";
};

export const previewEvents: WebEventCardEvent[] = [
  {
    id: "evt-1",
    name: "Spring Career Fair 2026",
    description: "Connect with top employers hiring for internships and full-time roles across Montgomery County.",
    location: "Main Gymnasium",
    date: "2026-04-18",
    time: "10:00 AM",
    cover_image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1600&auto=format&fit=crop",
    rsvp_count: 86,
    organizer_name: "Career Services",
  },
  {
    id: "evt-2",
    name: "Student Leadership Workshop",
    description: "A practical session on communication, planning, and leading stronger campus organizations.",
    location: "Student Union Building",
    date: "2026-04-21",
    time: "4:00 PM",
    cover_image_url: "https://images.unsplash.com/photo-1515169067868-5387ec356754?q=80&w=1600&auto=format&fit=crop",
    rsvp_count: 41,
    organizer_name: "Student Leadership Office",
  },
  {
    id: "evt-3",
    name: "Networking Mixer",
    description: "Meet students, alumni, and faculty in a relaxed evening networking session.",
    location: "Campus Center Lounge",
    date: "2026-04-24",
    time: "5:30 PM",
    cover_image_url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1600&auto=format&fit=crop",
    rsvp_count: 59,
    organizer_name: "Student Life Office",
  },
  {
    id: "evt-4",
    name: "EESA Cultural Night",
    description: "An evening of music, storytelling, and food celebrating East African student culture on campus.",
    location: "Performing Arts Hall",
    date: "2026-04-27",
    time: "6:30 PM",
    cover_image_url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1600&auto=format&fit=crop",
    rsvp_count: 112,
    organizer_name: "Ethiopian & Eritrean Student Association",
  },
  {
    id: "evt-5",
    name: "Hack Night Showcase",
    description: "Student builders demo projects, prototypes, and startup ideas from the semester.",
    location: "Science Center",
    date: "2026-03-12",
    time: "7:00 PM",
    cover_image_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop",
    rsvp_count: 74,
    organizer_name: "Computer Science Club",
  },
  {
    id: "evt-6",
    name: "Community Service Kickoff",
    description: "Volunteer orientation and planning session for spring service projects across the region.",
    location: "Humanities Hall",
    date: "2026-03-04",
    time: "3:00 PM",
    cover_image_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1600&auto=format&fit=crop",
    rsvp_count: 33,
    organizer_name: "Community Outreach",
  },
];

export const previewClubs: PreviewClub[] = [
  {
    id: "club-1",
    name: "Computer Science Club",
    description: "A community for students interested in software engineering, project building, and technical interview prep.",
    members: 142,
    campus: "Montgomery College",
    category: "Academic",
    initials: "CS",
    color: "bg-blue-600",
    coverImageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "club-2",
    name: "Ethiopian & Eritrean Student Association",
    description: "Celebrating and educating the campus about Ethiopian and Eritrean culture, history, food, and traditions.",
    members: 89,
    campus: "Montgomery College",
    category: "Cultural",
    initials: "EE",
    color: "bg-green-600",
    coverImageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "club-3",
    name: "Student Senate",
    description: "The student voice for policy advocacy, campus improvements, and leadership across the college.",
    members: 30,
    campus: "All Campuses",
    category: "Leadership",
    initials: "SS",
    color: "bg-[#51237f]",
    coverImageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "club-4",
    name: "Cybersecurity Society",
    description: "Hands-on workshops, certifications support, and practical security challenges for students in tech.",
    members: 124,
    campus: "Montgomery College",
    category: "Technology",
    initials: "CS",
    color: "bg-cyan-600",
    coverImageUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1600&auto=format&fit=crop",
  },
];

export const previewClubEvents = {
  [slugifyClubName("Computer Science Club")]: [
    { id: "club-evt-1", name: "Hack Night Showcase", date: "2026-04-19", time: "7:00 PM", location: "Science Center" },
    { id: "club-evt-2", name: "Interview Prep Sprint", date: "2026-04-26", time: "4:30 PM", location: "ST 214" },
  ],
  [slugifyClubName("Ethiopian & Eritrean Student Association")]: [
    { id: "club-evt-3", name: "EESA Cultural Night", date: "2026-04-27", time: "6:30 PM", location: "Performing Arts Hall" },
  ],
  [slugifyClubName("Student Senate")]: [
    { id: "club-evt-4", name: "Town Hall with Student Leaders", date: "2026-04-20", time: "2:00 PM", location: "Student Union Building" },
  ],
  [slugifyClubName("Cybersecurity Society")]: [
    { id: "club-evt-5", name: "Blue Team Lab", date: "2026-04-23", time: "5:00 PM", location: "Cyber Lab 102" },
  ],
} satisfies Record<string, { id: string; name: string; date: string; time: string; location: string }[]>;

export const previewActivityRegistrations: PreviewActivityRegistration[] = [
  {
    id: "reg-1",
    eventName: "Spring Career Fair 2026",
    clubName: "Career Services",
    dateLabel: "Saturday, Apr 18, 2026 • 10:00 AM",
    location: "Main Gymnasium",
    status: "Confirmed",
    isUpcoming: true,
  },
  {
    id: "reg-2",
    eventName: "EESA Cultural Night",
    clubName: "Ethiopian & Eritrean Student Association",
    dateLabel: "Monday, Apr 27, 2026 • 6:30 PM",
    location: "Performing Arts Hall",
    status: "Confirmed",
    isUpcoming: true,
  },
];

export const previewActivityMemberships: PreviewActivityMembership[] = [
  {
    id: "mem-1",
    name: "Computer Science Club",
    role: "Member",
    joinedLabel: "Joined Aug 2025",
    initials: "CS",
    badgeTone: "member",
  },
  {
    id: "mem-2",
    name: "Student Senate",
    role: "Secretary (Officer)",
    joinedLabel: "Joined Sep 2025",
    initials: "SS",
    badgeTone: "officer",
  },
];
