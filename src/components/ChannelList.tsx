"use client";

import Link from "next/link";
import { CHANNELS } from "@/lib/channels";
import { useState, useEffect } from "react";

export default function ChannelList() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchCounts() {
      const results = await Promise.all(
        CHANNELS.map(async (ch) => {
          try {
            const res = await fetch(`/api/channel/${ch.id}`);
            const data = await res.json();
            const count = (data.participants || []).filter((p: { status: string }) => p.status === "active").length;
            return { id: ch.id, count };
          } catch {
            return { id: ch.id, count: 0 };
          }
        })
      );
      const map: Record<string, number> = {};
      results.forEach((r) => (map[r.id] = r.count));
      setCounts(map);
    }
    fetchCounts();
    const interval = setInterval(fetchCounts, 10000);
    return () => clearInterval(interval);
  }, []);

  const totalOnline = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="w-full max-w-sm">
      {/* 전체 접속자 */}
      {totalOnline > 0 && (
        <div className="flex items-center justify-center gap-1.5 mb-4 text-sm text-zinc-500">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span>현재 <span className="font-bold text-zinc-700">{totalOnline}명</span> 근무 중</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {CHANNELS.map((ch) => {
          const count = counts[ch.id] || 0;
          return (
            <Link
              key={ch.id}
              href={`/channel/${ch.id}`}
              className={`relative ${ch.headerBg} rounded-2xl p-4 pb-3 hover:shadow-md active:scale-[0.97] hover:scale-[1.02] transition-all group border border-white/50`}
            >
              {count > 0 && (
                <span className="absolute top-3 right-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-zinc-500">{count}</span>
                </span>
              )}

              <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">
                {ch.emoji}
              </span>
              <p className="font-bold text-zinc-700 text-sm leading-tight">
                {ch.name}
              </p>
              <p className="text-[11px] text-zinc-400 mt-1 leading-snug line-clamp-2">
                {ch.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
