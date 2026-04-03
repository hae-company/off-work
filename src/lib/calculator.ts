export interface CalcInput {
  startHour: number;
  startMinute: number;
  breakMinutes: number;
  workHours: number;
  extraMinutes: number;
}

export interface CalcResult {
  endHour: number;
  endMinute: number;
  endTimeStr: string;
  grade: Grade;
  message: string;
}

export interface Grade {
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const GRADES: { maxMinutes: number; grade: Grade }[] = [
  {
    maxMinutes: 17 * 60 + 30,
    grade: {
      label: "전설의 칼퇴",
      emoji: "🏆",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    },
  },
  {
    maxMinutes: 18 * 60,
    grade: {
      label: "칼퇴 성공권",
      emoji: "🎉",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
    },
  },
  {
    maxMinutes: 18 * 60 + 30,
    grade: {
      label: "무난한 퇴근",
      emoji: "😊",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
  },
  {
    maxMinutes: 19 * 60,
    grade: {
      label: "퇴근 지연 구간",
      emoji: "😰",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
  },
  {
    maxMinutes: Infinity,
    grade: {
      label: "야근 위험",
      emoji: "💀",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
  },
];

const MESSAGES: Record<string, string[]> = {
  "전설의 칼퇴": [
    "오늘은 전설이 됩니다. 퇴근 후 치킨 각.",
    "이 시간에 퇴근이라니... 부럽습니다.",
    "칼퇴를 넘어선 초월퇴근입니다.",
    "퇴근길 노을이 아직 남아있을 시간이에요.",
    "오늘 당신은 회사의 전설입니다.",
  ],
  "칼퇴 성공권": [
    "오늘은 꽤 사람답게 퇴근할 수 있습니다.",
    "집에서 저녁 해먹을 수 있는 시간이에요!",
    "칼퇴 성공! 오늘 하루도 수고했어요.",
    "퇴근 후 넷플릭스 한 편 가능합니다.",
    "당신의 워라밸, 오늘은 합격입니다.",
  ],
  "무난한 퇴근": [
    "나쁘지 않아요. 평범한 하루입니다.",
    "퇴근은 가능하지만 칼퇴는 아닙니다.",
    "오늘도 평화로운 퇴근을 기원합니다.",
    "저녁 약속은 살짝 서두르면 가능해요.",
    "무난하게 살아남은 하루네요.",
  ],
  "퇴근 지연 구간": [
    "살짝 위험하지만 아직 희망은 있습니다.",
    "오늘 저녁은 편의점이 될 수도...",
    "퇴근 시간이 슬슬 애매해지고 있어요.",
    "아슬아슬한 줄타기 중입니다.",
    "집이 당신을 기다리고 있어요... 조금만 더!",
  ],
  "야근 위험": [
    "오늘도 회사와 깊은 대화를 나누게 되겠군요.",
    "퇴근은 내일의 출근과 함께...",
    "집이 당신을 잊기 시작했습니다.",
    "야근 확정. 편의점 도시락 추천드립니다.",
    "오늘의 교훈: 내일은 좀 더 일찍 오자.",
  ],
};

function getGrade(endTotalMinutes: number): Grade {
  for (const { maxMinutes, grade } of GRADES) {
    if (endTotalMinutes <= maxMinutes) return grade;
  }
  return GRADES[GRADES.length - 1].grade;
}

function getRandomMessage(gradeLabel: string): string {
  const msgs = MESSAGES[gradeLabel] || MESSAGES["무난한 퇴근"];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

export function calculate(input: CalcInput): CalcResult {
  const startTotalMinutes = input.startHour * 60 + input.startMinute;
  const endTotalMinutes =
    startTotalMinutes +
    input.workHours * 60 +
    input.breakMinutes +
    input.extraMinutes;

  const endHour = Math.floor(endTotalMinutes / 60);
  const endMinute = endTotalMinutes % 60;

  const grade = getGrade(endTotalMinutes);
  const message = getRandomMessage(grade.label);

  return {
    endHour,
    endMinute,
    endTimeStr: `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`,
    grade,
    message,
  };
}
