"use client";

interface TimeInputProps {
  startHour: number;
  startMinute: number;
  breakMinutes: number;
  workHours: number;
  extraMinutes: number;
  onStartHourChange: (v: number) => void;
  onStartMinuteChange: (v: number) => void;
  onBreakChange: (v: number) => void;
  onWorkHoursChange: (v: number) => void;
  onExtraChange: (v: number) => void;
}

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg py-2.5 text-sm font-semibold transition-all duration-150 ${
        selected
          ? "bg-violet-600 text-white shadow-sm"
          : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
      }`}
    >
      {children}
    </button>
  );
}

export default function TimeInput(props: TimeInputProps) {
  return (
    <div className="space-y-5">
      {/* 출근 시간 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-zinc-500">
            출근 시간
          </label>
          <button
            onClick={() => {
              const n = new Date();
              props.onStartHourChange(n.getHours());
              // 5분 단위로 내림
              props.onStartMinuteChange(Math.floor(n.getMinutes() / 5) * 5);
            }}
            className="text-[11px] text-violet-500 hover:text-violet-700 font-semibold transition-colors"
          >
            지금 시간으로
          </button>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={props.startHour}
            onChange={(e) => props.onStartHourChange(Number(e.target.value))}
            className="flex-1 rounded-lg border border-zinc-200 px-3 py-2.5 text-base font-semibold text-zinc-800 bg-white focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
          >
            {Array.from({ length: 14 }, (_, i) => i + 5).map((h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, "0")}시
              </option>
            ))}
          </select>
          <span className="text-xl text-zinc-300 font-bold">:</span>
          <select
            value={props.startMinute}
            onChange={(e) => props.onStartMinuteChange(Number(e.target.value))}
            className="flex-1 rounded-lg border border-zinc-200 px-3 py-2.5 text-base font-semibold text-zinc-800 bg-white focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
          >
            {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
              <option key={m} value={m}>
                {String(m).padStart(2, "0")}분
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 점심/휴게 시간 */}
      <div>
        <label className="block text-sm font-semibold text-zinc-500 mb-2">
          점심/휴게 시간
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[30, 60, 90].map((m) => (
            <OptionButton
              key={m}
              selected={props.breakMinutes === m}
              onClick={() => props.onBreakChange(m)}
            >
              {m}분
            </OptionButton>
          ))}
        </div>
      </div>

      {/* 목표 근무 시간 */}
      <div>
        <label className="block text-sm font-semibold text-zinc-500 mb-2">
          목표 근무 시간
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[7, 8, 9].map((h) => (
            <OptionButton
              key={h}
              selected={props.workHours === h}
              onClick={() => props.onWorkHoursChange(h)}
            >
              {h}시간
            </OptionButton>
          ))}
        </div>
      </div>

      {/* 추가 근무 */}
      <div>
        <label className="block text-sm font-semibold text-zinc-500 mb-2">
          추가 근무
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[0, 30, 60, 90].map((m) => (
            <OptionButton
              key={m}
              selected={props.extraMinutes === m}
              onClick={() => props.onExtraChange(m)}
            >
              {m === 0 ? "없음" : `${m}분`}
            </OptionButton>
          ))}
        </div>
      </div>
    </div>
  );
}
