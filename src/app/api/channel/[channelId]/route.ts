import { NextRequest, NextResponse } from "next/server";
import {
  getChannelData,
  addParticipant,
  heartbeat,
  markLeft,
  addChatMessage,
} from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const { channelId } = await params;
  const data = await getChannelData(channelId);
  return NextResponse.json(data);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const { channelId } = await params;
  const body = await req.json();

  switch (body.action) {
    case "heartbeat":
      await heartbeat(channelId, body.nickname);
      return NextResponse.json(await getChannelData(channelId));

    case "leave":
      await markLeft(channelId, body.nickname);
      return NextResponse.json(await getChannelData(channelId));

    case "chat":
      await addChatMessage(channelId, body.nickname, body.text);
      return NextResponse.json(await getChannelData(channelId));

    default: {
      const finalNickname = await addParticipant(channelId, {
        nickname: body.nickname,
        startTime: body.startTime,
        endTime: body.endTime,
        endTotalMinutes: body.endTotalMinutes,
        gradeLabel: body.gradeLabel,
        gradeEmoji: body.gradeEmoji,
        joinedAt: body.joinedAt,
      });
      const data = await getChannelData(channelId);
      return NextResponse.json({ ...data, finalNickname });
    }
  }
}
