import { MemberChatRoom } from "@/components/manage/member-chat-room";

export default async function ManageMemberChatRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12 lg:px-8">
      <MemberChatRoom roomId={roomId} />
    </main>
  );
}
