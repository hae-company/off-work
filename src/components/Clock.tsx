"use client";

import { useState, useEffect } from "react";

export default function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  if (!now) return null;

  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  // 18시(6PM) 기준 남은 시간 계산
  const sixPM = 18 * 60;
  const nowMins = h * 60 + m;
  const diff = sixPM - nowMins;

  let hint = "";
  if (diff <= 0) {
    hint = "이미 6시가 지났습니다. 퇴근하세요!";
  } else if (diff <= 30) {
    hint = `6시까지 ${diff}분! 거의 다 왔다!`;
  } else if (diff <= 60) {
    hint = `6시까지 ${diff}분 남았어요`;
  } else {
    const hh = Math.floor(diff / 60);
    const mm = diff % 60;
    hint = `6시까지 ${hh}시간 ${mm}분`;
  }

  return (
    <div className="text-center mb-6">
      <p className="font-mono text-4xl font-black text-zinc-800 tracking-tight tabular-nums">
        {timeStr}
      </p>
      <p className="text-xs text-zinc-400 mt-1">{hint}</p>
    </div>
  );
}
