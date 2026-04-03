export interface Participant {
  nickname: string;
  startTime: string;
  endTime: string;
  endTotalMinutes: number;
  gradeLabel: string;
  gradeEmoji: string;
  joinedAt: number;
}

export interface ChannelRoom {
  channelId: string;
  participants: Participant[];
}

// 채널별 참여자 저장소 (채널은 항상 존재)
const channels = new Map<string, ChannelRoom>();

export function getChannelRoom(channelId: string): ChannelRoom {
  if (!channels.has(channelId)) {
    channels.set(channelId, { channelId, participants: [] });
  }
  return channels.get(channelId)!;
}

function resolveNickname(room: ChannelRoom, nickname: string): string {
  const existing = new Set(room.participants.map((p) => p.nickname));
  if (!existing.has(nickname)) return nickname;
  let n = 2;
  while (existing.has(`${nickname} ${n}`)) n++;
  return `${nickname} ${n}`;
}

export interface AddResult {
  room: ChannelRoom;
  finalNickname: string;
}

export function addParticipant(
  channelId: string,
  participant: Participant
): AddResult {
  const room = getChannelRoom(channelId);

  participant.nickname = resolveNickname(room, participant.nickname);
  room.participants.push(participant);
  room.participants.sort((a, b) => a.endTotalMinutes - b.endTotalMinutes);

  return { room, finalNickname: participant.nickname };
}
