export interface ChannelEvent {
  text: string;
  emoji: string;
  effect: "good" | "bad" | "neutral";
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  emoji: string;
  bgColor: string;
  headerBg: string;
  accentColor: string;
  vibe: string;
  events: ChannelEvent[];
}

export const CHANNELS: Channel[] = [
  {
    id: "office",
    name: "적막한 사무실",
    description: "형광등 아래, 키보드 소리만 울리는 그곳",
    emoji: "🏢",
    bgColor: "bg-slate-50",
    headerBg: "bg-gradient-to-r from-slate-100 to-blue-50",
    accentColor: "text-blue-600",
    vibe: "조용히 칼퇴를 노리는 중...",
    events: [
      { text: "부장님이 자리를 비웠다! 지금이 찬스!", emoji: "👀", effect: "good" },
      { text: "갑자기 회의 소집... 30분 추가 각", emoji: "📋", effect: "bad" },
      { text: "옆자리 동료가 커피를 건넸다. 힘내!", emoji: "☕", effect: "good" },
      { text: "프린터가 고장났다. 수리 대기 중...", emoji: "🖨️", effect: "neutral" },
      { text: "팀장님이 \"잠깐 볼까\" 라고 했다...", emoji: "😰", effect: "bad" },
      { text: "점심 메뉴가 제육볶음이다! 사기 충전!", emoji: "🍖", effect: "good" },
      { text: "에어컨이 너무 세다... 담요 어딨지", emoji: "🥶", effect: "neutral" },
      { text: "오늘 야근 없다는 공지가 떴다!", emoji: "🎉", effect: "good" },
      { text: "퇴근 10분 전, 긴급 메일이 도착했다", emoji: "📧", effect: "bad" },
      { text: "자판기에서 음료가 두 개 나왔다. 럭키!", emoji: "🍀", effect: "good" },
    ],
  },
  {
    id: "construction",
    name: "땀내나는 건설현장",
    description: "안전모 쓰고, 오늘도 현장 사수 중",
    emoji: "🏗️",
    bgColor: "bg-orange-50",
    headerBg: "bg-gradient-to-r from-orange-100 to-amber-50",
    accentColor: "text-orange-600",
    vibe: "해 지기 전에 끝내자!",
    events: [
      { text: "비가 온다! 오늘 일찍 철수할 수도?", emoji: "🌧️", effect: "good" },
      { text: "안전교육 시간입니다. 잠깐 쉬어가세요", emoji: "⛑️", effect: "neutral" },
      { text: "점심 삼겹살 각! 소주는 참는다...", emoji: "🥩", effect: "good" },
      { text: "레미콘이 늦게 왔다. 대기 시간 발생", emoji: "🚛", effect: "neutral" },
      { text: "감리가 떴다! 긴장 모드 ON", emoji: "🕵️", effect: "bad" },
      { text: "현장소장님이 빵을 돌렸다. 감동...", emoji: "🍞", effect: "good" },
      { text: "폭염 특보! 2시간 휴식 발동!", emoji: "☀️", effect: "good" },
      { text: "설계 변경이 또 내려왔다...", emoji: "📐", effect: "bad" },
      { text: "오늘 안전사고 제로! 무사히 마무리", emoji: "✅", effect: "good" },
      { text: "크레인 고장... 오늘은 여기까지?", emoji: "🏗️", effect: "neutral" },
    ],
  },
  {
    id: "remote",
    name: "안 씻고 재택 중",
    description: "파자마 입고 컴퓨터 앞에 앉은 지 8시간째",
    emoji: "🏠",
    bgColor: "bg-purple-50",
    headerBg: "bg-gradient-to-r from-purple-100 to-pink-50",
    accentColor: "text-purple-600",
    vibe: "침대가 부른다...",
    events: [
      { text: "택배 도착! 잠깐 자리 비움", emoji: "📦", effect: "neutral" },
      { text: "갑자기 화상회의 카메라 켜야 한다... 급히 세수!", emoji: "📸", effect: "bad" },
      { text: "냉장고에서 아이스크림 발견. 오늘의 보상", emoji: "🍦", effect: "good" },
      { text: "고양이가 키보드 위에 올라왔다", emoji: "🐱", effect: "neutral" },
      { text: "와이파이 끊겼다! 핫스팟 전환 중...", emoji: "📡", effect: "bad" },
      { text: "이웃집 공사 소음이 시작됐다...", emoji: "🔨", effect: "bad" },
      { text: "슬랙 알림 0개. 모두가 나를 잊었나?", emoji: "😶", effect: "neutral" },
      { text: "배달 음식 도착! 점심 해결", emoji: "🍕", effect: "good" },
      { text: "침대에서 5분만 눕겠다고 한 게 1시간 전...", emoji: "😴", effect: "bad" },
      { text: "오늘 하루 아무도 카메라 안 켰다. 평화", emoji: "✌️", effect: "good" },
    ],
  },
  {
    id: "cafe",
    name: "카페에서 일하는 척",
    description: "아메리카노 한 잔으로 자리 지키는 중",
    emoji: "☕",
    bgColor: "bg-amber-50",
    headerBg: "bg-gradient-to-r from-amber-100 to-yellow-50",
    accentColor: "text-amber-700",
    vibe: "와이파이만 빠르면 여기가 천국",
    events: [
      { text: "자리 눈치... 음료 한 잔 더 시켜야 하나", emoji: "👀", effect: "neutral" },
      { text: "옆 테이블에서 떠드는 중... 집중력 붕괴", emoji: "🗣️", effect: "bad" },
      { text: "콘센트 자리 득템! 배터리 걱정 끝", emoji: "🔋", effect: "good" },
      { text: "노트북 화면에 커피를 쏟을 뻔했다", emoji: "😱", effect: "bad" },
      { text: "카페 BGM이 딱 내 취향이다. 능률 UP", emoji: "🎵", effect: "good" },
      { text: "사장님이 쿠키를 서비스로 줬다!", emoji: "🍪", effect: "good" },
      { text: "와이파이가 느려지기 시작했다...", emoji: "🐌", effect: "bad" },
      { text: "창밖 풍경 보면서 잠깐 힐링 타임", emoji: "🌿", effect: "good" },
      { text: "화장실 갔다 왔더니 내 자리에 사람이...", emoji: "😨", effect: "bad" },
      { text: "오늘 카페 포인트 적립 완료. 다음 잔 무료!", emoji: "🎫", effect: "good" },
    ],
  },
  {
    id: "hospital",
    name: "병원 당직실",
    description: "콜 올까봐 눈 감지도 못하는 밤",
    emoji: "🏥",
    bgColor: "bg-emerald-50",
    headerBg: "bg-gradient-to-r from-emerald-100 to-teal-50",
    accentColor: "text-emerald-600",
    vibe: "퇴근이 뭔지 잊어버린 사람들",
    events: [
      { text: "콜 없이 1시간 경과! 기적 같은 평화", emoji: "🕊️", effect: "good" },
      { text: "응급 환자 입원! 퇴근 위기...", emoji: "🚑", effect: "bad" },
      { text: "당직 교대 시간이 다가온다. 조금만 버텨!", emoji: "⏰", effect: "good" },
      { text: "보호자 면담 요청이 들어왔다", emoji: "👨‍👩‍👧", effect: "neutral" },
      { text: "간호사 선생님이 간식을 돌렸다!", emoji: "🍫", effect: "good" },
      { text: "차트 정리 아직 안 끝났다...", emoji: "📝", effect: "bad" },
      { text: "수술 스케줄이 밀렸다. 야근 확정", emoji: "🔪", effect: "bad" },
      { text: "환자가 감사 인사를 전했다. 뿌듯", emoji: "💕", effect: "good" },
      { text: "의국실 커피머신이 고장났다. 비상!", emoji: "☕", effect: "bad" },
      { text: "오늘 당직 끝! 내일은 OFF!", emoji: "🎊", effect: "good" },
    ],
  },
  {
    id: "school",
    name: "학교 교무실",
    description: "수업 끝나도 업무는 안 끝나는 마법",
    emoji: "🏫",
    bgColor: "bg-sky-50",
    headerBg: "bg-gradient-to-r from-sky-100 to-cyan-50",
    accentColor: "text-sky-600",
    vibe: "종이 울려도 퇴근은 아직...",
    events: [
      { text: "학부모 상담 전화가 왔다...", emoji: "📞", effect: "bad" },
      { text: "5교시 자습이다! 잠깐 쉬자", emoji: "📖", effect: "good" },
      { text: "시험지 채점이 아직 산더미...", emoji: "📝", effect: "bad" },
      { text: "급식이 맛있다! 오늘 돈까스", emoji: "🍱", effect: "good" },
      { text: "학생이 선생님 감사하다고 편지를 줬다", emoji: "💌", effect: "good" },
      { text: "방과후 수업 있으셨죠? 교감 선생님이...", emoji: "🫠", effect: "bad" },
      { text: "교무회의가 예상보다 일찍 끝났다!", emoji: "🎉", effect: "good" },
      { text: "생활기록부 마감이 코앞이다...", emoji: "📋", effect: "bad" },
      { text: "동료 선생님이 빵을 나눠줬다", emoji: "🥐", effect: "good" },
      { text: "오늘 학교 행사 덕분에 수업이 없다!", emoji: "🏃", effect: "good" },
    ],
  },
];

export function getChannel(id: string): Channel {
  return CHANNELS.find((c) => c.id === id) || CHANNELS[0];
}
