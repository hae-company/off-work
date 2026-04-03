import { NextRequest, NextResponse } from "next/server";
import { getChannelRoom, addParticipant } from "@/lib/room-store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const { channelId } = await params;
  const room = getChannelRoom(channelId);
  return NextResponse.json(room);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const { channelId } = await params;
  const participant = await req.json();
  const { room, finalNickname } = addParticipant(channelId, participant);
  return NextResponse.json({ ...room, finalNickname });
}
