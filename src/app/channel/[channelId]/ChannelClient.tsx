"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { calculate } from "@/lib/calculator";
import { getChannel } from "@/lib/channels";
import { generateNickname } from "@/lib/nicknames";
import {
  getRankTitle,
  getGapComment,
  getRandomItem,
  WINNER_MESSAGES,
  LOSER_MESSAGES,
} from "@/lib/ranking-messages";
import TimeInput from "@/components/TimeInput";

interface Participant {
  nickname: string;
  startTime: string;
  endTime: string;
  endTotalMinutes: number;
  gradeLabel: string;
  gradeEmoji: string;
  joinedAt: number;
  lastSeen: number;
  leftAt: number | null;
  status: "active" | "away" | "left";
}

interface ChatMessage {
  nickname: string;
  text: string;
  timestamp: number;
}

interface ChannelData {
  channelId: string;
  participants: Participant[];
  chat: ChatMessage[];
}

const QUICK_CHATS = [
  "배고프다...", "졸려 죽겠다", "퇴근하고싶다", "화이팅!",
  "ㅋㅋㅋㅋ", "힘내세요~", "점심 뭐 먹지", "커피 마시러",
];

function getSession(channelId: string) {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`offwork-${channelId}`);
    if (!raw) return null;
    return JSON.parse(raw) as {
      nickname: string;
      startHour: number;
      startMinute: number;
      breakMinutes: number;
      workHours: number;
      extraMinutes: number;
      hasLeft: boolean;
    };
  } catch { return null; }
}

function saveSession(channelId: string, data: object) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(`offwork-${channelId}`, JSON.stringify(data));
}

function clearSession(channelId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(`offwork-${channelId}`);
}

export default function ChannelClient({ channelId }: { channelId: string }) {
  const channel = getChannel(channelId);
  const session = getSession(channelId);

  // 상태
  const [room, setRoom] = useState<ChannelData | null>(null);
  const [nickname, setNickname] = useState(() => session?.nickname ?? generateNickname());
  const [joined, setJoined] = useState(!!session);
  const [hasLeft, setHasLeft] = useState(session?.hasLeft ?? false);
  const [copied, setCopied] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAllRanking, setShowAllRanking] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [now, setNow] = useState(() => new Date());

  const chatEndRef = useRef<HTMLDivElement>(null);
  const nicknameRef = useRef(nickname);
  nicknameRef.current = nickname;

  // 메시지 고정
  const winnerNickname = room?.participants[0]?.nickname ?? null;
  const loserNick = room && room.participants.length > 1 ? room.participants[room.participants.length - 1]?.nickname : null;
  const winnerMsg = useMemo(() => getRandomItem(WINNER_MESSAGES), [winnerNickname]);
  const loserMsg = useMemo(() => getRandomItem(LOSER_MESSAGES), [loserNick]);

  // 입력
  const [startHour, setStartHour] = useState(session?.startHour ?? 9);
  const [startMinute, setStartMinute] = useState(session?.startMinute ?? 0);
  const [breakMinutes, setBreakMinutes] = useState(session?.breakMinutes ?? 60);
  const [workHours, setWorkHours] = useState(session?.workHours ?? 8);
  const [extraMinutes, setExtraMinutes] = useState(session?.extraMinutes ?? 0);

  // ── API ──

  const api = useCallback(async (body?: object) => {
    const res = await fetch(`/api/channel/${channelId}`, body ? {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    } : {});
    if (res.ok) return res.json();
    return null;
  }, [channelId]);

  const fetchRoom = useCallback(async () => {
    const data = await api();
    if (data) setRoom(data);
  }, [api]);

  // ── 초기 로드 ──
  useEffect(() => { fetchRoom(); }, [fetchRoom]);

  // ── Heartbeat + 데이터 갱신 (2초) ──
  useEffect(() => {
    if (!joined || hasLeft) return;
    const interval = setInterval(async () => {
      const data = await api({ action: "heartbeat", nickname: nicknameRef.current });
      if (data) setRoom(data);
    }, 2000);
    return () => clearInterval(interval);
  }, [joined, hasLeft, api]);

  // ── 브라우저 종료/페이지 이동 시 heartbeat 중단 (자동 퇴장됨) ──
  useEffect(() => {
    if (!joined || hasLeft) return;
    const onBeforeUnload = () => {
      // sendBeacon으로 마지막 신호 없이 종료 → 30초 후 자동 away
      // 별도 처리 불필요 - heartbeat 멈추면 자동으로 away 됨
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [joined, hasLeft]);

  // ── 시계 ──
  useEffect(() => {
    if (!joined) return;
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, [joined]);

  // ── 채팅 스크롤 ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [room?.chat.length]);

  // ── 핸들러 ──

  const handleJoin = async () => {
    if (!nickname.trim()) return;
    const result = calculate({ startHour, startMinute, breakMinutes, workHours, extraMinutes });
    const data = await api({
      nickname: nickname.trim(),
      startTime: `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`,
      endTime: result.endTimeStr,
      endTotalMinutes: result.endHour * 60 + result.endMinute,
      gradeLabel: result.grade.label,
      gradeEmoji: result.grade.emoji,
      joinedAt: Date.now(),
    });
    if (data) {
      setNickname(data.finalNickname);
      setRoom(data);
      setJoined(true);
      saveSession(channelId, {
        nickname: data.finalNickname,
        startHour, startMinute, breakMinutes, workHours, extraMinutes,
        hasLeft: false,
      });
    }
  };

  const handleLeave = async () => {
    const data = await api({ action: "leave", nickname });
    if (data) setRoom(data);
    setHasLeft(true);
    saveSession(channelId, {
      nickname, startHour, startMinute, breakMinutes, workHours, extraMinutes,
      hasLeft: true,
    });
  };

  const handleChat = async (text: string) => {
    if (!text.trim()) return;
    const data = await api({ action: "chat", nickname, text: text.trim() });
    if (data) setRoom(data);
    setChatInput("");
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `${channel.emoji} ${channel.name}에서 근무 중!\n같이 칼퇴 대전 하자 → ${url}`;
    if (navigator.share) {
      try { await navigator.share({ title: "칼퇴 계산기", text, url }); } catch { /* */ }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── 로딩 ──
  if (!room) {
    return (
      <main className={`flex-1 flex items-center justify-center ${channel.bgColor} min-h-screen`}>
        <p className="text-zinc-400">로딩 중...</p>
      </main>
    );
  }

  // ── 출근 전 ──
  if (!joined) {
    const activeCount = room.participants.filter(p => p.status === "active").length;
    return (
      <main className={`flex-1 flex flex-col items-center px-4 py-10 ${channel.bgColor} min-h-screen`}>
        <div className={`w-full max-w-sm ${channel.headerBg} rounded-2xl p-5 mb-6 text-center`}>
          <span className="text-5xl block mb-2">{channel.emoji}</span>
          <h1 className="text-xl font-black text-zinc-800">{channel.name}</h1>
          <p className="text-sm text-zinc-400 mt-1">{channel.description}</p>
          {activeCount > 0 && (
            <div className="mt-3 pt-3 border-t border-white/50">
              <p className="text-xs text-zinc-500 font-semibold mb-2">
                현재 {activeCount}명 근무 중
              </p>
              <div className="flex flex-wrap justify-center gap-1">
                {room.participants.filter(p => p.status === "active").slice(0, 8).map((p) => (
                  <span key={p.nickname} className="text-[10px] bg-white/70 text-zinc-500 px-2 py-0.5 rounded-full">
                    {p.nickname}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
          <p className="text-sm font-semibold text-zinc-700 mb-4">출근 등록</p>
          <div className="mb-5">
            <label className="block text-sm font-semibold text-zinc-500 mb-2">오늘의 별명</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-zinc-200 px-3 py-2.5 bg-zinc-50">
                <p className="text-base font-bold text-zinc-800">{nickname}</p>
              </div>
              <button onClick={() => setNickname(generateNickname())} className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-500 hover:bg-zinc-100 transition-colors shrink-0">🎲</button>
            </div>
          </div>
          <TimeInput
            startHour={startHour} startMinute={startMinute}
            breakMinutes={breakMinutes} workHours={workHours} extraMinutes={extraMinutes}
            onStartHourChange={setStartHour} onStartMinuteChange={setStartMinute}
            onBreakChange={setBreakMinutes} onWorkHoursChange={setWorkHours}
            onExtraChange={setExtraMinutes}
          />
          <button onClick={handleJoin} className="w-full mt-6 bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-3.5 text-base font-bold transition-colors">
            출근하기
          </button>
        </div>
        <a href="/" className="mt-4 text-sm text-zinc-400 hover:text-zinc-600 transition-colors">← 다른 근무지 선택</a>
      </main>
    );
  }

  // ── 근무 중 계산 ──
  // away 상태 제외한 참여자만 표시
  const activeCount = room.participants.filter(p => p.status === "active").length;
  const leftCount = room.participants.filter(p => p.status === "left").length;
  const total = room.participants.length;
  const winner = total > 0 ? room.participants[0] : null;
  const loser = total > 1 ? room.participants[total - 1] : null;
  const gapMinutes = winner && loser ? loser.endTotalMinutes - winner.endTotalMinutes : 0;

  const me = room.participants.find((p) => p.nickname === nickname);
  const myStartMinutes = startHour * 60 + startMinute;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const workedRaw = nowMinutes - myStartMinutes - breakMinutes;
  const workedMinutes = Math.max(0, workedRaw);
  const totalWorkMinutes = workHours * 60 + extraMinutes;
  const remainingMinutes = Math.max(0, totalWorkMinutes - workedMinutes);
  const progressPercent = Math.min(100, Math.round((workedMinutes / totalWorkMinutes) * 100));
  const nowTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  const isDone = progressPercent >= 100;
  const isAlmost = remainingMinutes > 0 && remainingMinutes <= 10;

  const statusMessage =
    isDone ? "퇴근 시간 지났는데요...?" :
    isAlmost ? `${remainingMinutes}분 남았다!! 짐 싸기 시작!` :
    remainingMinutes <= 30 ? "슬슬 정리 시작해도 되는 시간" :
    progressPercent >= 75 ? "4쿼터 돌입. 끝이 보인다" :
    progressPercent >= 50 ? "반환점 통과! 내리막이다" :
    progressPercent >= 25 ? "아직 한참 남았다..." :
    "긴 하루의 시작...";

  const progressColor = isDone ? "text-emerald-500" : isAlmost ? "text-orange-500" : progressPercent >= 75 ? "text-violet-500" : progressPercent >= 50 ? "text-blue-500" : "text-zinc-400";
  const barColor = isDone ? "bg-emerald-500" : isAlmost ? "bg-orange-500" : progressPercent >= 75 ? "bg-violet-500" : progressPercent >= 50 ? "bg-blue-500" : "bg-zinc-300";

  return (
    <main className={`flex-1 flex flex-col items-center px-4 py-6 ${channel.bgColor} min-h-screen`}>
      {/* 채널 헤더 */}
      <div className={`w-full max-w-sm ${channel.headerBg} rounded-2xl p-4 mb-4`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{channel.emoji}</span>
          <div className="flex-1">
            <h1 className="text-base font-bold text-zinc-800">{channel.name}</h1>
            <p className="text-xs text-zinc-400 italic">{channel.vibe}</p>
          </div>
          <div className="text-right">
            <span className="text-xs bg-white/80 text-zinc-500 px-2 py-1 rounded-full font-medium">
              {activeCount}명 근무 중
            </span>
            {leftCount > 0 && (
              <p className="text-[10px] text-zinc-400 mt-1">{leftCount}명 퇴근</p>
            )}
          </div>
        </div>
      </div>

      {/* 내 근무 현황 */}
      {me && (
        <div className={`w-full max-w-sm rounded-2xl shadow-sm p-5 mb-3 fade-in-up ${
          hasLeft ? "bg-zinc-50 border-2 border-zinc-200" :
          isDone ? "bg-emerald-50 border-2 border-emerald-200 celebrate" :
          isAlmost ? "bg-orange-50 border-2 border-orange-200" :
          "bg-white border border-zinc-100"
        }`}>
          {hasLeft ? (
            <div className="text-center">
              <p className="text-5xl mb-2">🚪</p>
              <p className="text-xl font-black text-zinc-600 mb-1">퇴근 완료!</p>
              <p className="text-sm text-zinc-400">오늘도 수고하셨습니다</p>
            </div>
          ) : isDone ? (
            <div className="text-center">
              <p className="text-5xl mb-2">🎉</p>
              <p className="text-2xl font-black text-emerald-600 mb-1">퇴근 시간!</p>
              <p className="font-mono text-lg font-bold text-emerald-700 mb-3">{nowTimeStr}</p>
              <button onClick={handleLeave} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3.5 text-base font-bold transition-colors">
                🚀 퇴근합니다!
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-4">
                <p className={`font-mono text-3xl font-black tracking-tight ${isAlmost ? "text-orange-600 urgency" : "text-zinc-800"}`}>{nowTimeStr}</p>
                <p className="text-xs text-zinc-400 mt-1">{nickname}</p>
              </div>
              <div className="relative mb-4">
                <div className="flex justify-between text-[10px] text-zinc-400 mb-1.5">
                  <span>{me.startTime}</span>
                  <span className={`font-bold ${progressColor}`}>{progressPercent}%</span>
                  <span>{me.endTime}</span>
                </div>
                <div className="w-full h-4 bg-zinc-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${barColor} ${isAlmost ? "progress-bar-animated" : ""}`} style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-center bg-zinc-50 rounded-xl py-4">
                  <p className="text-[10px] text-zinc-400 mb-1 uppercase tracking-wider font-semibold">근무</p>
                  <p className="text-xl font-black text-zinc-800 tabular-nums">
                    {Math.floor(workedMinutes / 60)}<span className="text-sm font-bold text-zinc-400">h </span>
                    {workedMinutes % 60}<span className="text-sm font-bold text-zinc-400">m</span>
                  </p>
                </div>
                <div className={`text-center rounded-xl py-4 ${isAlmost ? "bg-orange-100" : "bg-zinc-50"}`}>
                  <p className="text-[10px] text-zinc-400 mb-1 uppercase tracking-wider font-semibold">남은 시간</p>
                  <p className={`text-xl font-black tabular-nums ${isAlmost ? "text-orange-600 urgency" : "text-violet-600"}`}>
                    {Math.floor(remainingMinutes / 60)}<span className={`text-sm font-bold ${isAlmost ? "text-orange-300" : "text-violet-300"}`}>h </span>
                    {remainingMinutes % 60}<span className={`text-sm font-bold ${isAlmost ? "text-orange-300" : "text-violet-300"}`}>m</span>
                  </p>
                </div>
              </div>
              <p className={`text-center text-xs italic ${isAlmost ? "text-orange-500 font-semibold" : "text-zinc-400"}`}>{statusMessage}</p>
            </>
          )}
        </div>
      )}

      {/* 채팅 */}
      {!hasLeft && (
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-zinc-100 p-4 mb-3">
          <button onClick={() => setShowChat(!showChat)} className="w-full flex items-center justify-between text-sm">
            <span className="font-bold text-zinc-500">💬 {channel.chatName}</span>
            <span className="text-zinc-300 text-xs">{showChat ? "닫기" : room.chat.length > 0 ? `${room.chat.length}개` : "열기"}</span>
          </button>
          {showChat && (
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {QUICK_CHATS.map((text) => (
                  <button key={text} onClick={() => handleChat(text)} className="text-xs bg-zinc-100 hover:bg-violet-100 hover:text-violet-600 text-zinc-500 px-2.5 py-1.5 rounded-full transition-colors">
                    {text}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleChat(chatInput)}
                  placeholder="직접 입력..." maxLength={30}
                  className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none" />
                <button onClick={() => handleChat(chatInput)} className="bg-violet-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-violet-700 transition-colors">전송</button>
              </div>
            </div>
          )}
          {room.chat.length > 0 && (
            <div className="mt-3 pt-3 border-t border-zinc-100 space-y-1.5 max-h-32 overflow-y-auto">
              {room.chat.slice(-5).map((msg, i) => (
                <div key={i} className="text-xs text-zinc-500">
                  <span className="font-semibold text-zinc-600">{msg.nickname}</span> {msg.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>
      )}

      {/* 순위표 */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-zinc-100 p-5 mb-3">
        {total >= 2 && winner && loser && (
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-100">
            <div className="flex-1 text-center">
              <p className="text-[10px] text-amber-500 font-semibold">👑 칼퇴왕</p>
              <p className="text-sm font-black text-amber-700 truncate">{winner.nickname}</p>
              <p className="text-xs text-amber-500">{winner.endTime}</p>
            </div>
            <div className="text-xs text-zinc-300 font-bold">vs</div>
            <div className="flex-1 text-center">
              <p className="text-[10px] text-red-400 font-semibold">🫠 야근왕</p>
              <p className="text-sm font-black text-red-500 truncate">{loser.nickname}</p>
              <p className="text-xs text-red-400">{loser.endTime}</p>
            </div>
          </div>
        )}

        <h2 className="text-sm font-bold text-zinc-500 mb-3">퇴근 순위</h2>
        {total === 0 ? (
          <div className="text-center py-6">
            <p className="text-zinc-400 text-sm">아직 아무도 출근 안 했어요</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {(showAllRanking ? room.participants : room.participants.slice(0, 5)).map((p, idx) => {
                const rank = idx + 1;
                const { title } = getRankTitle(rank, total);
                const isFirst = rank === 1;
                const isLast = rank === total && total >= 2;
                const isMe = p.nickname === nickname;
                const isGone = p.status === "left";

                return (
                  <div key={p.nickname} className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm ${
                    isGone ? "bg-zinc-50 opacity-60" :
                    isFirst ? "bg-amber-50 border border-amber-100" :
                    isLast ? "bg-red-50 border border-red-100" :
                    isMe ? "bg-violet-50 border border-violet-100" : "bg-zinc-50"
                  }`}>
                    <div className="w-7 text-center text-lg">
                      {isGone ? "🚪" : rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : <span className="text-sm font-bold text-zinc-300">{rank}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold truncate ${isGone ? "text-zinc-400 line-through" : "text-zinc-800"}`}>{p.nickname}</span>
                        {isMe && <span className="text-[10px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded font-bold">나</span>}
                        {isGone && <span className="text-[10px] text-emerald-500 font-bold">퇴근!</span>}
                      </div>
                      <p className="text-xs text-zinc-400">{title} · {p.startTime} 출근</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-base font-black ${isGone ? "text-zinc-400" : isFirst ? "text-amber-600" : isLast ? "text-red-500" : "text-zinc-700"}`}>{p.endTime}</p>
                      <p className="text-[10px] text-zinc-400">{p.gradeEmoji} {p.gradeLabel}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {total > 5 && (
              <button onClick={() => setShowAllRanking(!showAllRanking)} className="w-full mt-3 text-xs text-violet-500 hover:text-violet-700 font-semibold py-1 transition-colors">
                {showAllRanking ? "접기" : `+${total - 5}명 더 보기`}
              </button>
            )}
          </>
        )}

        {total >= 2 && me && winner && (
          <div className="mt-4 pt-3 border-t border-zinc-100 space-y-1.5">
            {me.nickname === winner.nickname ? (
              <p className="text-center text-xs text-amber-600 font-bold">👑 당신이 1등!</p>
            ) : (
              <p className="text-center text-xs text-zinc-500">
                1등과의 차이 <span className="font-bold text-violet-600">{me.endTotalMinutes - winner.endTotalMinutes}분</span>
              </p>
            )}
            <p className="text-center text-[10px] text-zinc-400">{getGapComment(gapMinutes)}</p>
          </div>
        )}
      </div>

      {/* 버튼 */}
      <div className="w-full max-w-sm space-y-2 mt-1">
        <button onClick={handleShare} className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-3 text-sm font-bold transition-colors">
          {copied ? "링크 복사됨!" : "동료 부르기"}
        </button>
        <a href="/" className="block w-full text-center bg-white border border-zinc-200 text-zinc-500 rounded-xl py-3 text-sm font-semibold hover:bg-zinc-50 transition-colors">
          다른 근무지로 이동
        </a>
      </div>
    </main>
  );
}
