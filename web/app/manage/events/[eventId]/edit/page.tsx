import { EventEditPanel } from "@/components/manage/event-edit-panel";

export default async function ManageEditEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12 lg:px-8">
      <EventEditPanel eventId={eventId} />
    </main>
  );
}
