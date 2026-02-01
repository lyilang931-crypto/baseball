/**
 * 1問の選択肢
 */
export interface Choice {
  id: string;
  text: string;
}

/**
 * 表示用番号（1〜13）。検索・表示用。
 * DB参照には questionId (uuid) を使用する。
 */
export type QuestionNo = number;

/** 出典種別（固定問題か実データ由来か判別用） */
export type SourceType = "static" | "data";

/** 共通フィールド（難易度 1〜5、1が易しい） */
interface QuestionBase {
  /** 表示用番号（第N問など） */
  id: number;
  /** DB参照用。Supabase answer_logs / question_stats の question_id (uuid) */
  questionId: string;
  situation: string;
  count: string;
  choices: Choice[];
  answerChoiceId: string;
  explanation: string;
  sourceLabel: string;
  sourceUrl: string;
  /** 固定問題=static / 実データ=data（UIで出典表示に利用） */
  sourceType?: SourceType;
  /** 実データ由来の場合の試合/データID（任意） */
  sourceGameId?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

/** 定義ベースの問題 */
export interface DefinitionQuestion extends QuestionBase {
  kind: "definition";
}

/** 統計ベースの問題（season/metric/league/source_url を持つ） */
export interface StatQuestion extends QuestionBase {
  kind: "stat";
  season: number;
  metric: string;
  league: "MLB" | "NPB";
  source_url: string;
}

/** 1問の型（定義ベース or 統計ベース） */
export type Question = DefinitionQuestion | StatQuestion;

/** 問題ごとの安定 uuid（Supabase answer_logs / question_stats の question_id 用） */
const QUESTION_UUIDS = [
  "a1000001-0000-4000-8000-000000000001",
  "a1000002-0000-4000-8000-000000000002",
  "a1000003-0000-4000-8000-000000000003",
  "a1000004-0000-4000-8000-000000000004",
  "a1000005-0000-4000-8000-000000000005",
  "a1000006-0000-4000-8000-000000000006",
  "a1000007-0000-4000-8000-000000000007",
  "a1000008-0000-4000-8000-000000000008",
  "a1000009-0000-4000-8000-000000000009",
  "a100000a-0000-4000-8000-00000000000a",
  "a100000b-0000-4000-8000-00000000000b",
  "a100000c-0000-4000-8000-00000000000c",
  "a100000d-0000-4000-8000-00000000000d",
] as const;

const QUESTIONS_POOL: Question[] = [
  {
    kind: "definition",
    id: 1,
    questionId: QUESTION_UUIDS[0],
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
    sourceType: "static",
    difficulty: 3,
  },
  {
    kind: "definition",
    id: 2,
    questionId: QUESTION_UUIDS[1],
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
    sourceType: "static",
    difficulty: 1,
  },
  {
    kind: "definition",
    id: 3,
    questionId: QUESTION_UUIDS[2],
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
    sourceType: "static",
    difficulty: 5,
  },
  {
    kind: "definition",
    id: 4,
    questionId: QUESTION_UUIDS[3],
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
    sourceType: "static",
    difficulty: 3,
  },
  {
    kind: "definition",
    id: 5,
    questionId: QUESTION_UUIDS[4],
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
    sourceType: "static",
    difficulty: 4,
  },
  {
    kind: "definition",
    id: 6,
    questionId: QUESTION_UUIDS[5],
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
    sourceType: "static",
    difficulty: 2,
  },
  {
    kind: "definition",
    id: 7,
    questionId: QUESTION_UUIDS[6],
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
    sourceType: "static",
    difficulty: 4,
  },
  {
    kind: "definition",
    id: 8,
    questionId: QUESTION_UUIDS[7],
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
    sourceType: "static",
    difficulty: 1,
  },
  {
    kind: "definition",
    id: 9,
    questionId: QUESTION_UUIDS[8],
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
    sourceType: "static",
    difficulty: 5,
  },
  {
    kind: "definition",
    id: 10,
    questionId: QUESTION_UUIDS[9],
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
    sourceType: "static",
    difficulty: 2,
  },
  // 統計ベース問題
  {
    kind: "stat",
    id: 11,
    questionId: QUESTION_UUIDS[10],
    situation:
      "右投手×右打者、1-2カウントで「最も空振り率（Whiff%）が高い球種」は？",
    count: "MLB 2023 / metric: Whiff%",
    choices: [
      { id: "a", text: "フォーシーム" },
      { id: "b", text: "スライダー" },
      { id: "c", text: "フォーク" },
      { id: "d", text: "カーブ" },
    ],
    answerChoiceId: "c",
    explanation:
      "MLB 2023 の Whiff%（空振り率）ではフォークが最も高い球種でした。統計ベース問題です。",
    sourceLabel: "Baseball Savant",
    sourceUrl: "https://baseballsavant.mlb.com",
    sourceType: "data",
    difficulty: 4,
    season: 2023,
    metric: "Whiff%",
    league: "MLB",
    source_url: "https://baseballsavant.mlb.com",
  },
  {
    kind: "stat",
    id: 12,
    questionId: QUESTION_UUIDS[11],
    situation:
      "得点圏（ランナー2塁以上）で最も打率が高かった打球方向は？",
    count: "NPB 2022 / metric: Batting Average (RISP)",
    choices: [
      { id: "a", text: "引っ張り" },
      { id: "b", text: "センター返し" },
      { id: "c", text: "逆方向" },
      { id: "d", text: "内野ゴロ" },
    ],
    answerChoiceId: "b",
    explanation:
      "NPB 2022 の得点圏打率ではセンター返しが最も打率が高かった方向でした。統計ベース問題です。",
    sourceLabel: "NPB 公式",
    sourceUrl: "https://npb.jp/bis/",
    sourceType: "data",
    difficulty: 3,
    season: 2022,
    metric: "Batting Average (RISP)",
    league: "NPB",
    source_url: "https://npb.jp/bis/",
  },
  {
    kind: "stat",
    id: 13,
    questionId: QUESTION_UUIDS[12],
    situation:
      "シフト制限後（2023年MLB）、左打者で最も打率が上がった打球方向は？",
    count: "metric: Batting Average by Spray Angle",
    choices: [
      { id: "a", text: "一二塁間" },
      { id: "b", text: "三遊間" },
      { id: "c", text: "センター" },
      { id: "d", text: "左中間" },
    ],
    answerChoiceId: "b",
    explanation:
      "MLB 2023 のシフト制限後、左打者で三遊間方向の打率が最も上昇しました。統計ベース問題です。",
    sourceLabel: "Baseball Savant",
    sourceUrl: "https://baseballsavant.mlb.com/leaderboard/spray-angle",
    sourceType: "data",
    difficulty: 5,
    season: 2023,
    metric: "Batting Average by Spray Angle",
    league: "MLB",
    source_url: "https://baseballsavant.mlb.com/leaderboard/spray-angle",
  },
];

/** 1セッションで出題する問題数 */
export const QUESTIONS_PER_SESSION = 5;

/** 実データ問題か（sourceType === "data" または kind === "stat"） */
export function isDataQuestion(q: Question): boolean {
  return q.sourceType === "data" || q.kind === "stat";
}

/** 実データ問題の出典短縮表示（例: "NPB 2022", "MLB 2023"） */
export function getDataSourceShort(q: Question): string | null {
  if (q.sourceType !== "data" && q.kind !== "stat") return null;
  const stat = "season" in q && "league" in q ? q : null;
  if (stat) return `${stat.league} ${stat.season}`;
  return null;
}

export interface SessionOptions {
  /** 実データ問題のみ出題する（野球判断力トレーニング向け） */
  dataOnly?: boolean;
}

/**
 * 1セッション用にランダムでN問を選ぶ（重複なし）
 * @param options.dataOnly true のとき実データ問題のみから出題
 */
export function getSessionQuestions(options?: SessionOptions): Question[] {
  const pool =
    options?.dataOnly === true
      ? QUESTIONS_POOL.filter(isDataQuestion)
      : [...QUESTIONS_POOL];
  const n = Math.min(QUESTIONS_PER_SESSION, pool.length);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
