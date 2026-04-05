import { ClubEditPanel } from "@/components/manage/club-edit-panel";

export default async function ManageEditClubPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12 lg:px-8">
      <ClubEditPanel clubId={clubId} />
    </main>
  );
}
