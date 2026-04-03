"use client";

import { CalcResult } from "@/lib/calculator";
import { useState } from "react";
import Link from "next/link";

interface Props {
  result: CalcResult;
  startTime: string;
  onReset: () => void;
}

export default function ResultCard({ result, startTime, onReset }: Props) {
  const [copied, setCopied] = useState(false);

  const shareText = `${startTime} 출근 → ${result.endTimeStr} 퇴근 예정!\n${result.grade.emoji} ${result.grade.label}\n"${result.message}"`;

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "칼퇴 계산기", text: shareText }); } catch { /* */ }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto fade-in-up">
      <div className={`bg-white rounded-2xl shadow-sm border-2 ${result.grade.borderColor} p-6`}>
        {/* 등급 */}
        <div className="text-center mb-3">
          <span className="text-6xl block mb-2">{result.grade.emoji}</span>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${result.grade.color} ${result.grade.bgColor}`}>
            {result.grade.label}
          </span>
        </div>

        {/* 퇴근 시간 */}
        <div className="text-center mb-3">
          <p className="text-xs text-zinc-400 mb-1">예상 퇴근 시간</p>
          <p className={`text-5xl font-black tracking-tight ${result.grade.color}`}>
            {result.endTimeStr}
          </p>
        </div>

        {/* 출퇴근 흐름 */}
        <div className="flex items-center justify-center gap-2 mb-4 text-sm">
          <span className="bg-zinc-100 px-3 py-1.5 rounded-lg font-bold text-zinc-600">{startTime}</span>
          <span className="text-zinc-300">→</span>
          <span className={`${result.grade.bgColor} px-3 py-1.5 rounded-lg font-bold ${result.grade.color}`}>{result.endTimeStr}</span>
        </div>

        {/* 멘트 */}
        <div className={`${result.grade.bgColor} rounded-xl p-4 mb-5 text-center`}>
          <p className="text-sm text-zinc-600 font-medium leading-relaxed">
            &ldquo;{result.message}&rdquo;
          </p>
        </div>

        {/* 버튼 */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={onReset}
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl py-3 text-sm font-semibold transition-colors"
          >
            다시 계산
          </button>
          <button
            onClick={handleShare}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-3 text-sm font-semibold transition-colors"
          >
            {copied ? "복사됨!" : "공유하기"}
          </button>
        </div>

        {/* 채널 유도 */}
        <Link
          href="/"
          className="block text-center text-xs text-violet-500 hover:text-violet-700 font-semibold py-1 transition-colors"
        >
          동료들이랑 퇴근 시간 겨루기 →
        </Link>
      </div>
    </div>
  );
}
