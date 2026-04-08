import { createClient } from "@libsql/client";

const HEARTBEAT_TIMEOUT = 30_000;

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// ── 마이그레이션 (앱 시작 시 1회) ──

let migrated = false;

async function migrate() {
  if (migrated) return;
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel_id TEXT NOT NULL,
      nickname TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      end_total_minutes INTEGER NOT NULL,
      grade_label TEXT NOT NULL,
      grade_emoji TEXT NOT NULL,
      joined_at INTEGER NOT NULL,
      last_seen INTEGER NOT NULL,
      left_at INTEGER,
      created_date TEXT NOT NULL,
      UNIQUE(channel_id, nickname, created_date)
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel_id TEXT NOT NULL,
      nickname TEXT NOT NULL,
      text TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      created_date TEXT NOT NULL
    );
  `);
  migrated = true;
}

// ── 타입 ──

export interface Participant {
  nickname: string;
  startTime: string;
  endTime: string;
  endTotalMinutes: number;
  gradeLabel: string;
  gradeEmoji: string;
  joinedAt: number;
  lastSeen: number;
  leftAt: number | null;
  status: "active" | "left";
}

export interface ChatMessage {
  nickname: string;
  text: string;
  timestamp: number;
}

export interface ChannelData {
  channelId: string;
  participants: Participant[];
  chat: ChatMessage[];
}

// ── 유틸 ──

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function calcStatus(lastSeen: number, leftAt: number | null): "active" | "away" | "left" {
  if (leftAt) return "left";
  if (Date.now() - lastSeen > HEARTBEAT_TIMEOUT) return "away";
  return "active";
}

// ── 조회 ──

export async function getChannelData(channelId: string): Promise<ChannelData> {
  await migrate();
  const date = today();

  const [pRows, cRows] = await Promise.all([
    client.execute({
      sql: `SELECT nickname, start_time, end_time, end_total_minutes,
                   grade_label, grade_emoji, joined_at, last_seen, left_at
            FROM participants
            WHERE channel_id = ? AND created_date = ?
            ORDER BY end_total_minutes ASC`,
      args: [channelId, date],
    }),
    client.execute({
      sql: `SELECT nickname, text, timestamp FROM chat_messages
            WHERE channel_id = ? AND created_date = ?
            ORDER BY timestamp ASC LIMIT 50`,
      args: [channelId, date],
    }),
  ]);

  const participants: Participant[] = pRows.rows
    .map((r) => {
      const status = calcStatus(Number(r.last_seen), r.left_at ? Number(r.left_at) : null);
      return {
        nickname: String(r.nickname),
        startTime: String(r.start_time),
        endTime: String(r.end_time),
        endTotalMinutes: Number(r.end_total_minutes),
        gradeLabel: String(r.grade_label),
        gradeEmoji: String(r.grade_emoji),
        joinedAt: Number(r.joined_at),
        lastSeen: Number(r.last_seen),
        leftAt: r.left_at ? Number(r.left_at) : null,
        status: status as "active" | "left",
      };
    })
    .filter((p) => p.status !== ("away" as string));

  const chat: ChatMessage[] = cRows.rows.map((r) => ({
    nickname: String(r.nickname),
    text: String(r.text),
    timestamp: Number(r.timestamp),
  }));

  return { channelId, participants, chat };
}

// ── 출근 ──

export async function addParticipant(
  channelId: string,
  p: { nickname: string; startTime: string; endTime: string; endTotalMinutes: number; gradeLabel: string; gradeEmoji: string; joinedAt: number }
): Promise<string> {
  await migrate();
  const date = today();
  const now = Date.now();

  // 닉네임 중복 처리
  const existing = await client.execute({
    sql: `SELECT nickname FROM participants WHERE channel_id = ? AND created_date = ?`,
    args: [channelId, date],
  });
  const names = new Set(existing.rows.map((r) => String(r.nickname)));

  let finalNickname = p.nickname;
  if (names.has(finalNickname)) {
    let n = 2;
    while (names.has(`${finalNickname} ${n}`)) n++;
    finalNickname = `${finalNickname} ${n}`;
  }

  await client.execute({
    sql: `INSERT INTO participants (channel_id, nickname, start_time, end_time, end_total_minutes, grade_label, grade_emoji, joined_at, last_seen, created_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [channelId, finalNickname, p.startTime, p.endTime, p.endTotalMinutes, p.gradeLabel, p.gradeEmoji, p.joinedAt, now, date],
  });

  return finalNickname;
}

// ── Heartbeat ──

export async function heartbeat(channelId: string, nickname: string) {
  await migrate();
  await client.execute({
    sql: `UPDATE participants SET last_seen = ? WHERE channel_id = ? AND nickname = ? AND created_date = ?`,
    args: [Date.now(), channelId, nickname, today()],
  });
}

// ── 퇴근 ──

export async function markLeft(channelId: string, nickname: string) {
  await migrate();
  const now = Date.now();
  const date = today();

  await client.execute({
    sql: `UPDATE participants SET left_at = ?, last_seen = ? WHERE channel_id = ? AND nickname = ? AND created_date = ?`,
    args: [now, now, channelId, nickname, date],
  });

  await client.execute({
    sql: `INSERT INTO chat_messages (channel_id, nickname, text, timestamp, created_date) VALUES (?, ?, ?, ?, ?)`,
    args: [channelId, nickname, `${nickname}님이 퇴근했습니다! 🎉`, now, date],
  });
}

// ── 채팅 ──

export async function addChatMessage(channelId: string, nickname: string, text: string) {
  await migrate();
  await client.execute({
    sql: `INSERT INTO chat_messages (channel_id, nickname, text, timestamp, created_date) VALUES (?, ?, ?, ?, ?)`,
    args: [channelId, nickname, text, Date.now(), today()],
  });
}
