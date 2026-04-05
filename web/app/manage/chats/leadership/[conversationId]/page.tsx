import { LeadershipChatRoom } from "@/components/manage/leadership-chat-room";

export default async function ManageLeadershipChatRoomPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12 lg:px-8">
      <LeadershipChatRoom conversationId={conversationId} />
    </main>
  );
}
