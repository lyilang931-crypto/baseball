/**
 * 1問の選択肢
 */
export interface Choice {
  id: string;
  text: string;
}

/**
 * 1問の型
 * difficulty: 1〜5（1が易しい、5が難しい）
 */
export interface Question {
  id: number;
  situation: string;
  count: string;
  choices: Choice[];
  answerChoiceId: string;
  explanation: string;
  sourceLabel: string;
  sourceUrl: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

const QUESTIONS_POOL: Question[] = [
  {
    id: 1,
    situation: "9回裏・2アウト・満塁",
    count: "カウント 2-2",
    choices: [
      { id: "a", text: "強気にストレート" },
      { id: "b", text: "変化球でかわす" },
      { id: "c", text: "四球でもOK" },
    ],
    answerChoiceId: "a",
    explanation:
      "この場面では『ストレート』で勝負するのが正解。2-2のカウントで打者を抑えれば試合終了です。",
    sourceLabel: "野球戦術入門",
    sourceUrl: "https://ja.wikipedia.org/wiki/速球",
    difficulty: 3,
  },
  {
    id: 2,
    situation: "1回表・無死・1塁",
    count: "カウント 0-0",
    choices: [
      { id: "a", text: "初球からストレート" },
      { id: "b", text: "スライダーで様子見" },
      { id: "c", text: "牽制で走者をけん制" },
    ],
    answerChoiceId: "b",
    explanation:
      "序盤の無死1塁では『変化球で様子を見る』が定石。打者との駆け引きを重視します。",
    sourceLabel: "プロ野球采配読本",
    sourceUrl: "https://ja.wikipedia.org/wiki/スライダー_(球種)",
    difficulty: 1,
  },
  {
    id: 3,
    situation: "7回裏・1アウト・2塁3塁",
    count: "カウント 1-2",
    choices: [
      { id: "a", text: "フォークで空振り狙い" },
      { id: "b", text: "ストレートで内角攻め" },
      { id: "c", text: "敬遠して次の打者へ" },
    ],
    answerChoiceId: "a",
    explanation:
      "この場面では『フォーク』が最も空振りを取れる選択でした。1-2で追い込んでいるので決め球です。",
    sourceLabel: "変化球の教科書",
    sourceUrl: "https://ja.wikipedia.org/wiki/フォークボール",
    difficulty: 5,
  },
  {
    id: 4,
    situation: "3回表・2アウト・走者なし",
    count: "カウント 3-2",
    choices: [
      { id: "a", text: "ストレートで真っ向勝負" },
      { id: "b", text: "カーブで曲げる" },
      { id: "c", text: "フォークで落とす" },
    ],
    answerChoiceId: "c",
    explanation:
      "フルカウント・2アウトでは『フォークで落とす』が有効。打者が待ちに回りにくい球です。",
    sourceLabel: "投球論",
    sourceUrl: "https://ja.wikipedia.org/wiki/フォークボール",
    difficulty: 3,
  },
  {
    id: 5,
    situation: "5回裏・無死・満塁",
    count: "カウント 2-1",
    choices: [
      { id: "a", text: "速球で押し切る" },
      { id: "b", text: "スライダーで打ち取り" },
      { id: "c", text: "ゴロを打たせてダブルプレー" },
    ],
    answerChoiceId: "c",
    explanation:
      "無死満塁では『ゴロでダブルプレー』を狙うのが得点被害を最小にする選択でした。",
    sourceLabel: "守備配球の考え方",
    sourceUrl: "https://ja.wikipedia.org/wiki/併殺",
    difficulty: 4,
  },
  {
    id: 6,
    situation: "8回表・2アウト・1塁2塁",
    count: "カウント 0-2",
    choices: [
      { id: "a", text: "外角低めに逃げる" },
      { id: "b", text: "内角で抑える" },
      { id: "c", text: "スライダーで外に逃がす" },
    ],
    answerChoiceId: "b",
    explanation: "0-2で追い込んだら内角で打者の手元を詰める選択が有効です。",
    sourceLabel: "カウント別配球",
    sourceUrl: "https://ja.wikipedia.org/wiki/球種_(野球)",
    difficulty: 2,
  },
  {
    id: 7,
    situation: "延長10回裏・無死・2塁",
    count: "カウント 1-1",
    choices: [
      { id: "a", text: "敬遠して1塁2塁" },
      { id: "b", text: "真っ向勝負" },
      { id: "c", text: "牽制で2塁封殺狙い" },
    ],
    answerChoiceId: "b",
    explanation: "延長の無死2塁では敬遠より打者と勝負し、ダブルプレーを狙うケースが一般的です。",
    sourceLabel: "延長戦の采配",
    sourceUrl: "https://ja.wikipedia.org/wiki/延長戦",
    difficulty: 4,
  },
  {
    id: 8,
    situation: "2回裏・1アウト・走者なし",
    count: "カウント 2-0",
    choices: [
      { id: "a", text: "ストレートでストライク" },
      { id: "b", text: "変化球でボール球" },
      { id: "c", text: "牽制多めに" },
    ],
    answerChoiceId: "a",
    explanation: "2-0ではストライクを取りにいき、カウントを戻すのが基本です。",
    sourceLabel: "カウント別配球",
    sourceUrl: "https://ja.wikipedia.org/wiki/ボールカウント",
    difficulty: 1,
  },
  {
    id: 9,
    situation: "6回表・1アウト・満塁",
    count: "カウント 2-2",
    choices: [
      { id: "a", text: "フォークで決め球" },
      { id: "b", text: "ストレートで内角" },
      { id: "c", text: "スライダーで外へ" },
    ],
    answerChoiceId: "a",
    explanation: "満塁の2-2では空振りが取れるフォークで決める選択がリスクを抑えられます。",
    sourceLabel: "危機的場面の配球",
    sourceUrl: "https://ja.wikipedia.org/wiki/フォークボール",
    difficulty: 5,
  },
  {
    id: 10,
    situation: "4回裏・無死・1塁3塁",
    count: "カウント 1-0",
    choices: [
      { id: "a", text: "ゴロを打たせて併殺" },
      { id: "b", text: "三振を取る" },
      { id: "c", text: "牽制で3塁封殺" },
    ],
    answerChoiceId: "a",
    explanation: "無死1塁3塁ではゴロで併殺を狙い、失点を抑えるのが定石です。",
    sourceLabel: "守備配球の考え方",
    sourceUrl: "https://ja.wikipedia.org/wiki/併殺",
    difficulty: 2,
  },
];

/** 1セッションで出題する問題数 */
export const QUESTIONS_PER_SESSION = 5;

/**
 * 1セッション用にランダムで5問を選ぶ（重複なし）
 */
export function getSessionQuestions(): Question[] {
  const shuffled = [...QUESTIONS_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, QUESTIONS_PER_SESSION);
}
