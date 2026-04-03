"use client";

import { useState, useEffect, useCallback } from "react";
import { calculate } from "@/lib/calculator";
import { getChannel, ChannelEvent } from "@/lib/channels";
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
}

interface ChannelRoom {
  channelId: string;
  participants: Participant[];
}

export default function ChannelClient({ channelId }: { channelId: string }) {
  const channel = getChannel(channelId);
  const [room, setRoom] = useState<ChannelRoom | null>(null);
  const [nickname, setNickname] = useState(() => generateNickname());
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);

  const [currentEvent, setCurrentEvent] = useState<ChannelEvent | null>(null);
  const [eventVisible, setEventVisible] = useState(false);
  const [eventLog, setEventLog] = useState<ChannelEvent[]>([]);
  const [now, setNow] = useState(() => new Date());

  const [startHour, setStartHour] = useState(9);
  const [startMinute, setStartMinute] = useState(0);
  const [breakMinutes, setBreakMinutes] = useState(60);
  const [workHours, setWorkHours] = useState(8);
  const [extraMinutes, setExtraMinutes] = useState(0);

  const fetchRoom = useCallback(async () => {
    const res = await fetch(`/api/channel/${channelId}`);
    if (res.ok) setRoom(await res.json());
  }, [channelId]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  useEffect(() => {
    if (!joined) return;
    const interval = setInterval(fetchRoom, 5000);
    return () => clearInterval(interval);
  }, [joined, fetchRoom]);

  useEffect(() => {
    if (!joined) return;
    const triggerEvent = () => {
      const event = getRandomItem(channel.events);
      setCurrentEvent(event);
      setEventVisible(true);
      setEventLog((prev) => [event, ...prev].slice(0, 3));
      setTimeout(() => setEventVisible(false), 5000);
      const nextDelay = 20000 + Math.random() * 20000;
      timeoutId = setTimeout(triggerEvent, nextDelay);
    };
    let timeoutId = setTimeout(triggerEvent, 5000 + Math.random() * 5000);
    return () => clearTimeout(timeoutId);
  }, [joined, channel.events]);

  useEffect(() => {
    if (!joined) return;
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, [joined]);

  const handleJoin = async () => {
    if (!nickname.trim()) return;
    const result = calculate({ startHour, startMinute, breakMinutes, workHours, extraMinutes });
    const participant: Participant = {
      nickname: nickname.trim(),
      startTime: `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`,
      endTime: result.endTimeStr,
      endTotalMinutes: result.endHour * 60 + result.endMinute,
      gradeLabel: result.grade.label,
      gradeEmoji: result.grade.emoji,
      joinedAt: Date.now(),
    };
    const res = await fetch(`/api/channel/${channelId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(participant),
    });
    if (res.ok) {
      const data = await res.json();
      setNickname(data.finalNickname);
      setRoom(data);
      setJoined(true);
    }
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

  if (!room) {
    return (
      <main className={`flex-1 flex items-center justify-center ${channel.bgColor} min-h-screen`}>
        <p className="text-zinc-400">로딩 중...</p>
      </main>
    );
  }

  // ── 출근 전 ──
  if (!joined) {
    return (
      <main className={`flex-1 flex flex-col items-center px-4 py-10 ${channel.bgColor} min-h-screen`}>
        <div className={`w-full max-w-sm ${channel.headerBg} rounded-2xl p-5 mb-6 text-center`}>
          <span className="text-5xl block mb-2">{channel.emoji}</span>
          <h1 className="text-xl font-black text-zinc-800">{channel.name}</h1>
          <p className="text-sm text-zinc-400 mt-1">{channel.description}</p>
          {room.participants.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/50">
              <p className="text-xs text-zinc-500 font-semibold mb-2">
                현재 {room.participants.length}명 근무 중
              </p>
              <div className="flex flex-wrap justify-center gap-1">
                {room.participants.slice(0, 8).map((p) => (
                  <span key={p.nickname} className="text-[10px] bg-white/70 text-zinc-500 px-2 py-0.5 rounded-full">
                    {p.nickname}
                  </span>
                ))}
                {room.participants.length > 8 && (
                  <span className="text-[10px] text-zinc-400">+{room.participants.length - 8}명</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
          <p className="text-sm font-semibold text-zinc-700 mb-4">출근 등록</p>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-zinc-500 mb-2">
              오늘의 별명
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-zinc-200 px-3 py-2.5 bg-zinc-50">
                <p className="text-base font-bold text-zinc-800">{nickname}</p>
              </div>
              <button
                onClick={() => setNickname(generateNickname())}
                className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-500 hover:bg-zinc-100 transition-colors shrink-0"
              >
                🎲
              </button>
            </div>
          </div>

          <TimeInput
            startHour={startHour} startMinute={startMinute}
            breakMinutes={breakMinutes} workHours={workHours} extraMinutes={extraMinutes}
            onStartHourChange={setStartHour} onStartMinuteChange={setStartMinute}
            onBreakChange={setBreakMinutes} onWorkHoursChange={setWorkHours}
            onExtraChange={setExtraMinutes}
          />

          <button
            onClick={handleJoin}
            className="w-full mt-6 bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-3.5 text-base font-bold transition-colors"
          >
            출근하기
          </button>
        </div>

        <a href="/" className="mt-4 text-sm text-zinc-400 hover:text-zinc-600 transition-colors">
          ← 다른 근무지 선택
        </a>
      </main>
    );
  }

  // ── 근무 중 ──
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
  const isUrgent = remainingMinutes > 10 && remainingMinutes <= 30;

  const statusMessage =
    isDone ? "퇴근 시간 지났는데요...? 왜 아직 계신 거죠?" :
    isAlmost ? `${remainingMinutes}분 남았다!! 짐 싸기 시작!` :
    isUrgent ? "슬슬 정리 시작해도 되는 시간" :
    progressPercent >= 75 ? "4쿼터 돌입. 끝이 보인다" :
    progressPercent >= 50 ? "반환점 통과! 내리막이다" :
    progressPercent >= 25 ? "아직 한참 남았다..." :
    "긴 하루의 시작...";

  const progressColor =
    isDone ? "text-emerald-500" :
    isAlmost ? "text-orange-500" :
    progressPercent >= 75 ? "text-violet-500" :
    progressPercent >= 50 ? "text-blue-500" :
    "text-zinc-400";

  const barColor =
    isDone ? "bg-emerald-500" :
    isAlmost ? "bg-orange-500" :
    progressPercent >= 75 ? "bg-violet-500" :
    progressPercent >= 50 ? "bg-blue-500" :
    "bg-zinc-300";

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
          <span className="text-xs bg-white/80 text-zinc-500 px-2 py-1 rounded-full font-medium">
            {total}명 근무 중
          </span>
        </div>
      </div>

      {/* 내 근무 현황 - 메인 카드 */}
      {me && (
        <div className={`w-full max-w-sm rounded-2xl shadow-sm p-5 mb-3 fade-in-up ${
          isDone ? "bg-emerald-50 border-2 border-emerald-200 celebrate" :
          isAlmost ? "bg-orange-50 border-2 border-orange-200" :
          "bg-white border border-zinc-100"
        }`}>
          {/* 퇴근 완료 축하 */}
          {isDone ? (
            <div className="text-center">
              <p className="text-5xl mb-2">🎉</p>
              <p className="text-2xl font-black text-emerald-600 mb-1">퇴근 시간!</p>
              <p className="text-sm text-emerald-500 mb-3">짐 싸고 뛰어나가세요</p>
              <p className="font-mono text-lg font-bold text-emerald-700">{nowTimeStr}</p>
              <p className="text-xs text-zinc-400 mt-3 italic">{statusMessage}</p>
            </div>
          ) : (
            <>
              {/* 현재 시각 */}
              <div className="text-center mb-4">
                <p className={`font-mono text-3xl font-black tracking-tight ${isAlmost ? "text-orange-600 urgency" : "text-zinc-800"}`}>
                  {nowTimeStr}
                </p>
                <p className="text-xs text-zinc-400 mt-1">{nickname}</p>
              </div>

              {/* 프로그레스 */}
              <div className="relative mb-4">
                <div className="flex justify-between text-[10px] text-zinc-400 mb-1.5">
                  <span>{me.startTime}</span>
                  <span className={`font-bold ${progressColor}`}>{progressPercent}%</span>
                  <span>{me.endTime}</span>
                </div>
                <div className="w-full h-4 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${barColor} ${isAlmost ? "progress-bar-animated" : ""}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* 근무시간 / 남은시간 */}
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

              {/* 상태 메시지 */}
              <p className={`text-center text-xs italic ${isAlmost ? "text-orange-500 font-semibold" : "text-zinc-400"}`}>
                {statusMessage}
              </p>
            </>
          )}
        </div>
      )}

      {/* 이벤트 알림 */}
      {currentEvent && (
        <div
          className={`w-full max-w-sm rounded-2xl p-4 mb-3 border transition-all duration-500 ${
            eventVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
          } ${
            currentEvent.effect === "good" ? "bg-emerald-50 border-emerald-200"
            : currentEvent.effect === "bad" ? "bg-red-50 border-red-200"
            : "bg-zinc-50 border-zinc-200"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{currentEvent.emoji}</span>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${
                currentEvent.effect === "good" ? "text-emerald-700"
                : currentEvent.effect === "bad" ? "text-red-700"
                : "text-zinc-700"
              }`}>
                {currentEvent.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 칼퇴왕 */}
      {total >= 2 && winner && (
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-amber-200 p-4 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👑</span>
            <div className="flex-1">
              <p className="text-xs text-amber-500 font-semibold">오늘의 칼퇴왕</p>
              <p className="text-base font-black text-amber-700">{winner.nickname}</p>
            </div>
            <p className="text-lg font-black text-amber-600">{winner.endTime}</p>
          </div>
          <p className="text-xs text-zinc-400 mt-2 italic pl-11">
            {getRandomItem(WINNER_MESSAGES)}
          </p>
        </div>
      )}

      {/* 순위표 */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-zinc-100 p-5 mb-3">
        <h2 className="text-sm font-bold text-zinc-500 mb-3">퇴근 순위</h2>

        {total === 0 ? (
          <div className="text-center py-6">
            <p className="text-zinc-400 text-sm">아직 아무도 출근 안 했어요</p>
          </div>
        ) : (
          <div className="space-y-2">
            {room.participants.map((p, idx) => {
              const rank = idx + 1;
              const { title } = getRankTitle(rank, total);
              const isFirst = rank === 1;
              const isLast = rank === total && total >= 2;
              const isMe = p.nickname === nickname;

              return (
                <div
                  key={p.nickname}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm ${
                    isFirst ? "bg-amber-50 border border-amber-100"
                    : isLast ? "bg-red-50 border border-red-100"
                    : isMe ? "bg-violet-50 border border-violet-100"
                    : "bg-zinc-50"
                  }`}
                >
                  <div className="w-7 text-center text-lg">
                    {rank <= 3
                      ? ["🥇", "🥈", "🥉"][rank - 1]
                      : <span className="text-sm font-bold text-zinc-300">{rank}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-zinc-800 truncate">{p.nickname}</span>
                      {isMe && (
                        <span className="text-[10px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded font-bold">나</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400">{title} · {p.startTime} 출근</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-base font-black ${isFirst ? "text-amber-600" : isLast ? "text-red-500" : "text-zinc-700"}`}>
                      {p.endTime}
                    </p>
                    <p className="text-[10px] text-zinc-400">{p.gradeEmoji} {p.gradeLabel}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {total >= 2 && me && winner && (
          <div className="mt-4 pt-3 border-t border-zinc-100 space-y-1.5">
            {me.nickname === winner.nickname ? (
              <p className="text-center text-xs text-amber-600 font-bold">
                👑 당신이 1등! 이대로만 퇴근하세요
              </p>
            ) : (
              <p className="text-center text-xs text-zinc-500">
                1등과의 차이{" "}
                <span className="font-bold text-violet-600">
                  {me.endTotalMinutes - winner.endTotalMinutes}분
                </span>
              </p>
            )}
            <p className="text-center text-[10px] text-zinc-400">
              1등↔꼴찌 {gapMinutes}분 · {getGapComment(gapMinutes)}
            </p>
          </div>
        )}
      </div>

      {/* 야근왕 */}
      {total >= 2 && loser && (
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-red-100 p-3 mb-3">
          <div className="flex items-center gap-2 justify-center">
            <span>🫠</span>
            <span className="text-sm font-bold text-red-500">야근왕: {loser.nickname}</span>
          </div>
          <p className="text-xs text-zinc-400 italic mt-1 text-center">
            {getRandomItem(LOSER_MESSAGES)}
          </p>
        </div>
      )}

      {/* 이벤트 로그 */}
      {eventLog.length > 0 && (
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-zinc-100 p-4 mb-3">
          <h2 className="text-xs font-bold text-zinc-400 mb-2">오늘의 사건들</h2>
          <div className="space-y-1.5">
            {eventLog.map((ev, i) => (
              <div key={i} className={`flex items-center gap-2 text-xs ${i === 0 ? "text-zinc-600" : "text-zinc-400"}`}>
                <span>{ev.emoji}</span>
                <span className={i === 0 ? "font-medium" : ""}>{ev.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 버튼 */}
      <div className="w-full max-w-sm space-y-2 mt-1">
        <button
          onClick={handleShare}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-3 text-sm font-bold transition-colors"
        >
          {copied ? "링크 복사됨!" : "동료 부르기"}
        </button>
        <a
          href="/"
          className="block w-full text-center bg-white border border-zinc-200 text-zinc-500 rounded-xl py-3 text-sm font-semibold hover:bg-zinc-50 transition-colors"
        >
          다른 근무지로 이동
        </a>
      </div>

      <p className="mt-6 text-[10px] text-zinc-300">5초마다 자동 갱신</p>
    </main>
  );
}
