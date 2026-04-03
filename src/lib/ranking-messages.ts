// 순위별 칭호
export function getRankTitle(rank: number, total: number): { title: string; emoji: string } {
  if (rank === 1) return { title: "오늘의 칼퇴왕", emoji: "👑" };
  if (rank === 2) return { title: "칼퇴 준비생", emoji: "🥈" };
  if (rank === 3) return { title: "칼퇴 희망편", emoji: "🥉" };
  if (rank === total) return { title: "오늘의 야근왕", emoji: "🫠" };
  if (rank === total - 1) return { title: "야근 후보", emoji: "😵" };
  return { title: `${rank}등`, emoji: "💼" };
}

// 1등에게 하는 말
export const WINNER_MESSAGES = [
  "당신 때문에 모두가 자괴감을 느낍니다",
  "혹시 반차 쓰신 건 아니죠...?",
  "퇴근 속도 빛의 속도",
  "팀원들의 부러움을 한 몸에 받고 있습니다",
  "워라밸의 정석을 보여주고 계시네요",
];

// 꼴찌에게 하는 말
export const LOSER_MESSAGES = [
  "오늘도 회사가 당신을 사랑합니다",
  "내일은 좀 더 일찍 오세요... 제발",
  "집 주소를 회사로 바꾸는 건 어떨까요?",
  "당신의 희생에 팀원들이 감사하고 있습니다 (아마도)",
  "편의점 도시락 추천해드릴까요?",
];

// 퇴근시간 차이에 따른 코멘트
export function getGapComment(gapMinutes: number): string {
  if (gapMinutes === 0) return "동시 퇴근! 같이 나가자~";
  if (gapMinutes <= 10) return "거의 비슷해요! 아슬아슬";
  if (gapMinutes <= 30) return "살짝 차이 나네요";
  if (gapMinutes <= 60) return "한 시간 안으로 벌어졌어요";
  return "압도적 차이... 격차 사회";
}

export function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
