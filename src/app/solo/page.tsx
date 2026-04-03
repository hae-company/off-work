import Calculator from "@/components/Calculator";
import Clock from "@/components/Clock";

export default function SoloPage() {
  return (
    <main className="flex-1 flex flex-col items-center px-4 py-12">
      <div className="text-center mb-2">
        <p className="text-4xl mb-3">🧮</p>
        <h1 className="text-2xl font-black text-zinc-800 mb-1">
          혼자 조용히 계산하기
        </h1>
        <p className="text-zinc-400 text-xs">
          남들 눈치 안 보고 내 퇴근 시간만 확인
        </p>
      </div>

      <Clock />

      <Calculator />

      <a
        href="/"
        className="mt-8 text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
      >
        ← 근무지 선택으로
      </a>
    </main>
  );
}
