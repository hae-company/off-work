"use client";

import { useState } from "react";
import { calculate, CalcResult } from "@/lib/calculator";
import ResultCard from "./ResultCard";
import TimeInput from "./TimeInput";

export default function Calculator() {
  const [startHour, setStartHour] = useState(9);
  const [startMinute, setStartMinute] = useState(0);
  const [breakMinutes, setBreakMinutes] = useState(60);
  const [workHours, setWorkHours] = useState(8);
  const [extraMinutes, setExtraMinutes] = useState(0);
  const [result, setResult] = useState<CalcResult | null>(null);

  const handleCalculate = () => {
    setResult(
      calculate({ startHour, startMinute, breakMinutes, workHours, extraMinutes })
    );
  };

  if (result) {
    return (
      <ResultCard
        result={result}
        startTime={`${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`}
        onReset={() => setResult(null)}
      />
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
        <TimeInput
          startHour={startHour}
          startMinute={startMinute}
          breakMinutes={breakMinutes}
          workHours={workHours}
          extraMinutes={extraMinutes}
          onStartHourChange={setStartHour}
          onStartMinuteChange={setStartMinute}
          onBreakChange={setBreakMinutes}
          onWorkHoursChange={setWorkHours}
          onExtraChange={setExtraMinutes}
        />

        <button
          onClick={handleCalculate}
          className="w-full mt-6 bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-3.5 text-base font-bold transition-colors"
        >
          칼퇴 시간 계산하기
        </button>
      </div>
    </div>
  );
}
