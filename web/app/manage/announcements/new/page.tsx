import { AnnouncementComposer } from "@/components/manage/announcement-composer";

export const metadata = {
  title: "Send Announcement | Raptor Connect",
  description: "Publish a club update into your organization feed.",
};

export default async function ManageAnnouncementPage({
  searchParams,
}: {
  searchParams?: Promise<{ clubId?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <AnnouncementComposer initialClubId={resolvedSearchParams?.clubId} />
      </div>
    </div>
  );
}
