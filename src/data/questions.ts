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

/** 出典種別（配球セオリー=static / 実データ=data） */
export type SourceType = "static" | "data";

/** 問題タイプ（UI・出題ロジック用） */
export type QuestionType = "REAL_DATA" | "THEORY" | "KNOWLEDGE";

/** 共通フィールド（難易度 1〜5、1が易しい） */
interface QuestionBase {
  /** 表示用番号（第N問など） */
  id: number;
  /** DB参照用。Supabase answer_logs / question_stats の question_id (uuid) */
  questionId: string;
  /** 実データ / 配球セオリー / 知識問題 */
  questionType?: QuestionType;
  situation: string;
  count: string;
  choices: Choice[];
  answerChoiceId: string;
  explanation: string;
  sourceLabel: string;
  sourceUrl: string;
  /** 配球セオリー=static / 実データ=data（UIで出典表示に利用） */
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
  "a1000010-0000-4000-8000-000000000010",
  "a1000011-0000-4000-8000-000000000011",
  "a1000012-0000-4000-8000-000000000012",
  "a1000013-0000-4000-8000-000000000013",
  "a1000014-0000-4000-8000-000000000014",
  "a1000015-0000-4000-8000-000000000015",
  "a1000016-0000-4000-8000-000000000016",
  "a1000017-0000-4000-8000-000000000017",
  "a1000018-0000-4000-8000-000000000018",
] as const;

const QUESTIONS_POOL: Question[] = [
  {
    kind: "definition",
    questionType: "THEORY",
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
    questionType: "THEORY",
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
    questionType: "THEORY",
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
    questionType: "THEORY",
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
    questionType: "THEORY",
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
    questionType: "THEORY",
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
    questionType: "THEORY",
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
    questionType: "THEORY",
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
    questionType: "THEORY",
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
    questionType: "THEORY",
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
    questionType: "REAL_DATA",
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
    questionType: "REAL_DATA",
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
    questionType: "REAL_DATA",
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
  // ---------- 追加 REAL_DATA 7問（合計10問: MLB 6 / NPB 4、大谷2問以上） ----------
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 14,
    questionId: QUESTION_UUIDS[15],
    situation:
      "2023年MLBで大谷翔平が記録した本塁打数は、リーグで何位だった？",
    count: "MLB 2023 / metric: 本塁打",
    choices: [
      { id: "a", text: "1位" },
      { id: "b", text: "2位" },
      { id: "c", text: "3位" },
      { id: "d", text: "5位以内" },
    ],
    answerChoiceId: "a",
    explanation:
      "実データ問題：2023年MLBで大谷翔平は44本塁打でア・リーグ1位（MLB全体でも1位）。出典：Baseball-Reference / season 2023 / metric HR。",
    sourceLabel: "Baseball-Reference",
    sourceUrl: "https://www.baseball-reference.com/players/o/ohtansh01.shtml",
    sourceType: "data",
    difficulty: 2,
    season: 2023,
    metric: "本塁打",
    league: "MLB",
    source_url: "https://www.baseball-reference.com/players/o/ohtansh01.shtml",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 15,
    questionId: QUESTION_UUIDS[16],
    situation:
      "2024年MLBで大谷翔平が打者として記録したOPS（出塁率+長打率）は、リーグ上位何位程度だった？",
    count: "MLB 2024 / metric: OPS",
    choices: [
      { id: "a", text: "1位" },
      { id: "b", text: "3位以内" },
      { id: "c", text: "10位以内" },
      { id: "d", text: "20位以内" },
    ],
    answerChoiceId: "a",
    explanation:
      "実データ問題：2024年MLBで大谷翔平はOPSでナ・リーグ1位クラス。出典：MLB公式 / season 2024 / metric OPS。",
    sourceLabel: "MLB.com",
    sourceUrl: "https://www.mlb.com/stats/2024",
    sourceType: "data",
    difficulty: 2,
    season: 2024,
    metric: "OPS",
    league: "MLB",
    source_url: "https://www.mlb.com/stats/2024",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 16,
    questionId: QUESTION_UUIDS[17],
    situation:
      "2023年MLBのStatcastデータで、2ストライクから「空振り率（Whiff%）が最も高かった球種」は？",
    count: "MLB 2023 / metric: Whiff% (2ストライク)",
    choices: [
      { id: "a", text: "スライダー" },
      { id: "b", text: "チェンジアップ" },
      { id: "c", text: "フォーク・スプリット" },
      { id: "d", text: "カーブ" },
    ],
    answerChoiceId: "c",
    explanation:
      "実データ問題：MLB 2023のStatcastでは2ストライク後のWhiff%はフォーク・スプリット系が最も高い傾向。出典：Baseball Savant / season 2023 / metric Whiff%。",
    sourceLabel: "Baseball Savant",
    sourceUrl: "https://baseballsavant.mlb.com/statcast_leaderboard",
    sourceType: "data",
    difficulty: 4,
    season: 2023,
    metric: "Whiff% (2ストライク)",
    league: "MLB",
    source_url: "https://baseballsavant.mlb.com/statcast_leaderboard",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 17,
    questionId: QUESTION_UUIDS[18],
    situation:
      "2023年MLBで、打者の「飛距離（平均打球速度×打撃角度）」がリーグ上位だった打球方向は？",
    count: "MLB 2023 / metric: 飛距離・打球方向",
    choices: [
      { id: "a", text: "引っ張り" },
      { id: "b", text: "センター" },
      { id: "c", text: "逆方向" },
      { id: "d", text: "どれも同程度" },
    ],
    answerChoiceId: "a",
    explanation:
      "実データ問題：Statcastでは引っ張り方向の打球が飛距離・xwOBAで有利な傾向。出典：Baseball Savant / season 2023 / metric 飛距離・打球方向。",
    sourceLabel: "Baseball Savant",
    sourceUrl: "https://baseballsavant.mlb.com/leaderboard/statcast",
    sourceType: "data",
    difficulty: 3,
    season: 2023,
    metric: "飛距離・打球方向",
    league: "MLB",
    source_url: "https://baseballsavant.mlb.com/leaderboard/statcast",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 18,
    questionId: QUESTION_UUIDS[19],
    situation:
      "NPB公式記録によると、2023年セ・リーグで最多本塁打を記録した選手の所属チームは？",
    count: "NPB 2023 / metric: 本塁打",
    choices: [
      { id: "a", text: "ヤクルト" },
      { id: "b", text: "巨人" },
      { id: "c", text: "DeNA" },
      { id: "d", text: "広島" },
    ],
    answerChoiceId: "a",
    explanation:
      "実データ問題：2023年セ・リーグ最多本塁打は村上宗隆（ヤクルト）。出典：NPB公式 / season 2023 / metric 本塁打。",
    sourceLabel: "NPB 公式",
    sourceUrl: "https://npb.jp/bis/2023/stats/bat_c.html",
    sourceType: "data",
    difficulty: 2,
    season: 2023,
    metric: "本塁打",
    league: "NPB",
    source_url: "https://npb.jp/bis/2023/stats/bat_c.html",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 19,
    questionId: QUESTION_UUIDS[20],
    situation:
      "NPB公式記録より、2023年パ・リーグで最多奪三振を記録した投手の球団は？",
    count: "NPB 2023 / metric: 奪三振",
    choices: [
      { id: "a", text: "ロッテ" },
      { id: "b", text: "ソフトバンク" },
      { id: "c", text: "西武" },
      { id: "d", text: "日本ハム" },
    ],
    answerChoiceId: "a",
    explanation:
      "実データ問題：2023年パ・リーグ最多奪三振は佐々木朗希（ロッテ）。出典：NPB公式 / season 2023 / metric 奪三振。",
    sourceLabel: "NPB 公式",
    sourceUrl: "https://npb.jp/bis/2023/stats/pit_c.html",
    sourceType: "data",
    difficulty: 2,
    season: 2023,
    metric: "奪三振",
    league: "NPB",
    source_url: "https://npb.jp/bis/2023/stats/pit_c.html",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 22,
    questionId: QUESTION_UUIDS[21],
    situation:
      "NPB公式の2022年シーズン記録で、セ・リーグのチーム打率1位だった球団は？",
    count: "NPB 2022 / metric: チーム打率",
    choices: [
      { id: "a", text: "ヤクルト" },
      { id: "b", text: "巨人" },
      { id: "c", text: "DeNA" },
      { id: "d", text: "中日" },
    ],
    answerChoiceId: "a",
    explanation:
      "実データ問題：2022年セ・リーグチーム打率1位はヤクルト。出典：NPB公式 / season 2022 / metric チーム打率。",
    sourceLabel: "NPB 公式",
    sourceUrl: "https://npb.jp/bis/2022/stats/tmb_c.html",
    sourceType: "data",
    difficulty: 3,
    season: 2022,
    metric: "チーム打率",
    league: "NPB",
    source_url: "https://npb.jp/bis/2022/stats/tmb_c.html",
  },
];

/** 出題プール用: id で指定した問題を順に返す */
function pickByIds(pool: Question[], ids: readonly number[]): Question[] {
  return ids
    .map((id) => pool.find((q) => q.id === id))
    .filter((q): q is Question => q != null);
}

/** 実データ問題プール（厳密に5問）。questionType は REAL_DATA で明示。 */
const REAL_DATA_POOL: Question[] = pickByIds(QUESTIONS_POOL, [11, 12, 14, 15, 18]);

/** 配球セオリー問題プール（厳密に3問）。questionType は THEORY で明示。 */
const THEORY_POOL: Question[] = pickByIds(QUESTIONS_POOL, [1, 4, 7]);

/** 知識問題プール（厳密に2問）。questionType は KNOWLEDGE で明示。 */
const KNOWLEDGE_POOL: Question[] = [
  {
    kind: "definition",
    questionType: "KNOWLEDGE",
    id: 20,
    questionId: QUESTION_UUIDS[13],
    situation: "2024年MLBで最多勝を挙げた日本人投手は？",
    count: "知識問題",
    choices: [
      { id: "a", text: "山本由伸" },
      { id: "b", text: "今永昇太" },
      { id: "c", text: "ダルビッシュ有" },
    ],
    answerChoiceId: "a",
    explanation: "2024年は山本由伸が最多勝のタイトルを獲得しました。",
    sourceLabel: "MLB公式",
    sourceUrl: "https://www.mlb.com",
    sourceType: "static",
    difficulty: 2,
  },
  {
    kind: "definition",
    questionType: "KNOWLEDGE",
    id: 21,
    questionId: QUESTION_UUIDS[14],
    situation: "2023年ワールドシリーズ優勝チームは？",
    count: "知識問題",
    choices: [
      { id: "a", text: "レンジャーズ" },
      { id: "b", text: "ダイヤモンドバックス" },
      { id: "c", text: "フィリーズ" },
    ],
    answerChoiceId: "a",
    explanation: "2023年はテキサス・レンジャーズが優勝しました。",
    sourceLabel: "MLB公式",
    sourceUrl: "https://www.mlb.com",
    sourceType: "static",
    difficulty: 1,
  },
];

/** 1セッションで出題する問題数 */
export const QUESTIONS_PER_SESSION = 5;

/** 問題タイプを取得（未設定なら kind から推定） */
export function getQuestionType(q: Question): QuestionType {
  if (q.questionType) return q.questionType;
  return q.kind === "stat" ? "REAL_DATA" : "THEORY";
}

/** 実データ問題か */
export function isDataQuestion(q: Question): boolean {
  return getQuestionType(q) === "REAL_DATA";
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

/** 配列を Fisher–Yates でシャッフルし、先頭 n 件を返す（同一セッション内重複なし） */
function shuffleDraw<T>(pool: T[], n: number): T[] {
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

/** 制約を満たす構成 [REAL, THEORY, KNOW]。REAL>=2, KNOW<=1。REAL多めを少し優遇。 */
const SESSION_COMPOSITIONS: { r: number; t: number; k: number; weight: number }[] = [
  { r: 5, t: 0, k: 0, weight: 2 },
  { r: 4, t: 1, k: 0, weight: 2 },
  { r: 4, t: 0, k: 1, weight: 1 },
  { r: 3, t: 2, k: 0, weight: 2 },
  { r: 3, t: 1, k: 1, weight: 1 },
  { r: 2, t: 3, k: 0, weight: 1 },
  { r: 2, t: 2, k: 1, weight: 1 },
];

/** 重み付きで構成を1つ選ぶ */
function pickComposition(): { r: number; t: number; k: number } {
  const total = SESSION_COMPOSITIONS.reduce((s, c) => s + c.weight, 0);
  let r = Math.random() * total;
  for (const c of SESSION_COMPOSITIONS) {
    r -= c.weight;
    if (r <= 0) return { r: c.r, t: c.t, k: c.k };
  }
  return SESSION_COMPOSITIONS[0];
}

/**
 * 1セッション用に5問を選ぶ（soft constraints 付きランダム）。
 * - 構成 [REAL, THEORY, KNOW] を重み付きでランダムに選択（REAL>=2, KNOW<=1）
 * - 各プールから重複なしで抽選し、最後に並び順をシャッフル
 * @param options.dataOnly true のとき実データ5問のみシャッフルして出題
 */
export function getSessionQuestions(options?: SessionOptions): Question[] {
  if (options?.dataOnly === true) {
    return shuffleDraw(REAL_DATA_POOL, 5);
  }
  const { r, t, k } = pickComposition();
  const real = shuffleDraw(REAL_DATA_POOL, r);
  const theory = shuffleDraw(THEORY_POOL, t);
  const know = shuffleDraw(KNOWLEDGE_POOL, k);
  const five = [...real, ...theory, ...know];
  return shuffleDraw(five, 5);
}

/**
 * 開発者向け: getSessionQuestions を runs 回実行し、REAL/THEORY/KNOW の出現分布と
 * 制約違反（REAL<2, KNOW>1）の有無を console に出力する。
 * ブラウザの開発者ツールで window.verifySessionQuestionsDistribution?.() や
 * scripts/debug.ts から呼ぶ想定。
 */
export function verifySessionQuestionsDistribution(runs: number = 100): void {
  const realCounts: number[] = [];
  const theoryCounts: number[] = [];
  const knowCounts: number[] = [];
  let violationsReal = 0;
  let violationsKnow = 0;

  for (let i = 0; i < runs; i++) {
    const session = getSessionQuestions();
    let r = 0,
      t = 0,
      k = 0;
    for (const q of session) {
      const type = getQuestionType(q);
      if (type === "REAL_DATA") r++;
      else if (type === "THEORY") t++;
      else k++;
    }
    realCounts.push(r);
    theoryCounts.push(t);
    knowCounts.push(k);
    if (r < 2) violationsReal++;
    if (k > 1) violationsKnow++;
  }

  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  const avg = (arr: number[]) => sum(arr) / arr.length;
  /* eslint-disable no-console */
  console.log(`[verifySessionQuestionsDistribution] ${runs}回実行`);
  console.log("REAL_DATA 出現: 平均", avg(realCounts).toFixed(2), "回/セッション");
  console.log("THEORY 出現: 平均", avg(theoryCounts).toFixed(2), "回/セッション");
  console.log("KNOWLEDGE 出現: 平均", avg(knowCounts).toFixed(2), "回/セッション");
  console.log("制約違反: REAL<2 →", violationsReal, "件, KNOW>1 →", violationsKnow, "件");
  /* eslint-enable no-console */
}
