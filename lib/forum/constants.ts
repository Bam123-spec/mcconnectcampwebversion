export const FORUM_CATEGORIES = [
    { id: "general", label: "General", color: "bg-indigo-500", text: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
    { id: "lost_found", label: "Lost & Found", color: "bg-amber-500", text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    { id: "tips", label: "Tips", color: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { id: "marketplace", label: "Marketplace", color: "bg-purple-500", text: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
    { id: "questions", label: "Questions", color: "bg-sky-500", text: "text-sky-600", bg: "bg-sky-50", border: "border-sky-100" },
    { id: "announcements", label: "Announcements", color: "bg-rose-500", text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
];

export const getCategoryConfig = (categoryId: string) => {
    return FORUM_CATEGORIES.find(c => c.id === categoryId) || FORUM_CATEGORIES[0];
};
