import ChannelList from "@/components/ChannelList";
import Clock from "@/components/Clock";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center px-4 py-10">
      {/* 헤더 */}
      <div className="text-center mb-2">
        <p className="text-4xl mb-3">🏃‍♂️💨</p>
        <h1 className="text-2xl font-black text-zinc-800 mb-1">
          칼퇴 계산기
        </h1>
        <p className="text-zinc-400 text-xs">
          오늘 나는 몇 시에 탈출할 수 있을까?
        </p>
      </div>

      {/* 현재 시각 */}
      <Clock />

      {/* 구분선 */}
      <div className="w-full max-w-sm flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-zinc-200" />
        <span className="text-xs text-zinc-400 font-medium">오늘의 근무지</span>
        <div className="flex-1 h-px bg-zinc-200" />
      </div>

      {/* 채널 목록 */}
      <ChannelList />

      {/* 혼자 계산하기 */}
      <div className="w-full max-w-sm mt-5">
        <Link
          href="/solo"
          className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-zinc-400 hover:text-violet-500 transition-colors"
        >
          <span>🧮</span>
          혼자 조용히 계산만 하기
        </Link>
      </div>

      {/* 푸터 */}
      <Footer />
    </main>
  );
}
