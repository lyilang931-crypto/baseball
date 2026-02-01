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
  // 追加10問用 (id 23-32)
  "a1000019-0000-4000-8000-000000000019",
  "a100001a-0000-4000-8000-00000000001a",
  "a100001b-0000-4000-8000-00000000001b",
  "a100001c-0000-4000-8000-00000000001c",
  "a100001d-0000-4000-8000-00000000001d",
  "a100001e-0000-4000-8000-00000000001e",
  "a100001f-0000-4000-8000-00000000001f",
  "a1000020-0000-4000-8000-000000000020",
  "a1000021-0000-4000-8000-000000000021",
  "a1000022-0000-4000-8000-000000000022",
  // 追加10問用 (id 33-42)
  "a1000023-0000-4000-8000-000000000023",
  "a1000024-0000-4000-8000-000000000024",
  "a1000025-0000-4000-8000-000000000025",
  "a1000026-0000-4000-8000-000000000026",
  "a1000027-0000-4000-8000-000000000027",
  "a1000028-0000-4000-8000-000000000028",
  "a1000029-0000-4000-8000-000000000029",
  "a100002a-0000-4000-8000-00000000002a",
  "a100002b-0000-4000-8000-00000000002b",
  "a100002c-0000-4000-8000-00000000002c",
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
  // ---------- 追加 REAL_DATA 5問（MLB 3+ / NPB、有名選手 2問以上） ----------
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 23,
    questionId: QUESTION_UUIDS[22],
    situation:
      "2024年MLBで山本由伸が記録した防御率（ERA）は、規定投球回達成投手のうちリーグで何位タイだった？",
    count: "MLB 2024 / metric: ERA",
    choices: [
      { id: "a", text: "1位" },
      { id: "b", text: "2位タイ" },
      { id: "c", text: "5位以内" },
      { id: "d", text: "10位以内" },
    ],
    answerChoiceId: "a",
    explanation:
      "実データ問題：2024年山本由伸はナ・リーグで防御率1位タイ。出典：MLB.com / season 2024 / metric ERA。",
    sourceLabel: "MLB.com",
    sourceUrl: "https://www.mlb.com/stats/pitching/2024",
    sourceType: "data",
    difficulty: 3,
    season: 2024,
    metric: "ERA",
    league: "MLB",
    source_url: "https://www.mlb.com/stats/pitching/2024",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 24,
    questionId: QUESTION_UUIDS[23],
    situation:
      "2023年MLBでダルビッシュ有が記録した奪三振数は、リーグ内で上位何位程度だった？",
    count: "MLB 2023 / metric: 奪三振",
    choices: [
      { id: "a", text: "5位以内" },
      { id: "b", text: "10位以内" },
      { id: "c", text: "15位以内" },
      { id: "d", text: "20位以下" },
    ],
    answerChoiceId: "a",
    explanation:
      "実データ問題：2023年ダルビッシュ有はナ・リーグで奪三振上位。出典：Baseball-Reference / season 2023 / metric 奪三振。",
    sourceLabel: "Baseball-Reference",
    sourceUrl: "https://www.baseball-reference.com/players/d/darvish01.shtml",
    sourceType: "data",
    difficulty: 3,
    season: 2023,
    metric: "奪三振",
    league: "MLB",
    source_url: "https://www.baseball-reference.com/players/d/darvish01.shtml",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 25,
    questionId: QUESTION_UUIDS[24],
    situation:
      "2024年MLBのStatcastデータで、大谷翔平の「打球速度（Exit Velocity）平均」は打者全体で上位何％程度だった？",
    count: "MLB 2024 / metric: 平均打球速度",
    choices: [
      { id: "a", text: "上位5％" },
      { id: "b", text: "上位10％" },
      { id: "c", text: "上位20％" },
      { id: "d", text: "上位30％" },
    ],
    answerChoiceId: "a",
    explanation:
      "実データ問題：2024年大谷は平均打球速度でリーグ上位。出典：Baseball Savant / season 2024 / metric Exit Velocity。",
    sourceLabel: "Baseball Savant",
    sourceUrl: "https://baseballsavant.mlb.com/leaderboard/statcast",
    sourceType: "data",
    difficulty: 4,
    season: 2024,
    metric: "平均打球速度",
    league: "MLB",
    source_url: "https://baseballsavant.mlb.com/leaderboard/statcast",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 26,
    questionId: QUESTION_UUIDS[25],
    situation:
      "2023年MLBで「wOBA（加重出塁率）がリーグ上位だった打者」に日本人は何人含まれていた？（トップ30程度で）",
    count: "MLB 2023 / metric: wOBA",
    choices: [
      { id: "a", text: "2人以上" },
      { id: "b", text: "1人" },
      { id: "c", text: "0人" },
      { id: "d", text: "3人以上" },
    ],
    answerChoiceId: "a",
    explanation:
      "実データ問題：2023年大谷・鈴木誠也らがwOBA上位。出典：FanGraphs / season 2023 / metric wOBA。",
    sourceLabel: "FanGraphs",
    sourceUrl: "https://www.fangraphs.com/leaders.aspx?pos=all&stats=bat&lg=all&qual=0&type=8&season=2023",
    sourceType: "data",
    difficulty: 4,
    season: 2023,
    metric: "wOBA",
    league: "MLB",
    source_url: "https://www.fangraphs.com/leaders.aspx?pos=all&stats=bat&lg=all&qual=0&type=8&season=2023",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 27,
    questionId: QUESTION_UUIDS[26],
    situation:
      "NPB公式記録によると、2024年セ・リーグでチーム打率1位だった球団は？",
    count: "NPB 2024 / metric: チーム打率",
    choices: [
      { id: "a", text: "ヤクルト" },
      { id: "b", text: "巨人" },
      { id: "c", text: "DeNA" },
      { id: "d", text: "広島" },
    ],
    answerChoiceId: "b",
    explanation:
      "実データ問題：2024年セ・リーグチーム打率1位は巨人。出典：NPB公式 / season 2024 / metric チーム打率。",
    sourceLabel: "NPB 公式",
    sourceUrl: "https://npb.jp/bis/2024/stats/tmb_c.html",
    sourceType: "data",
    difficulty: 2,
    season: 2024,
    metric: "チーム打率",
    league: "NPB",
    source_url: "https://npb.jp/bis/2024/stats/tmb_c.html",
  },
  // ---------- 追加 THEORY 3問（カウント・走者・判断理由が説明できる） ----------
  {
    kind: "definition",
    questionType: "THEORY",
    id: 28,
    questionId: QUESTION_UUIDS[27],
    situation: "1回表・無死・2塁、カウント 1-2",
    count: "カウント 1-2",
    choices: [
      { id: "a", text: "外角低めのスライダーで空振り狙い" },
      { id: "b", text: "初球から内角ストレート" },
      { id: "c", text: "敬遠して1塁2塁" },
      { id: "d", text: "フォークで打者を落とす" },
    ],
    answerChoiceId: "a",
    explanation:
      "1-2で無死2塁では『外角低めのスライダー』で空振りを狙うのが有効。打者はストライクゾーンを広く見がちで、外に逃げる球に手を出しやすい。",
    sourceLabel: "カウント別配球",
    sourceUrl: "https://ja.wikipedia.org/wiki/球種_(野球)",
    sourceType: "static",
    difficulty: 3,
  },
  {
    kind: "definition",
    questionType: "THEORY",
    id: 29,
    questionId: QUESTION_UUIDS[28],
    situation: "8回裏・1アウト・1塁3塁、同点、カウント 2-1",
    count: "カウント 2-1",
    choices: [
      { id: "a", text: "ストレートでストライクを取りにいく" },
      { id: "b", text: "スキッシュのサインを出す" },
      { id: "c", text: "変化球で打者を惑わす" },
      { id: "d", text: "敬遠して満塁" },
    ],
    answerChoiceId: "a",
    explanation:
      "同点の1塁3塁・2-1では『ストライクを取りにいく』のが基本。ボールを重ねると満塁やワイルドピッチのリスクが増えるため、まずカウントを戻す。",
    sourceLabel: "危機的場面の配球",
    sourceUrl: "https://ja.wikipedia.org/wiki/ボールカウント",
    sourceType: "static",
    difficulty: 4,
  },
  {
    kind: "definition",
    questionType: "THEORY",
    id: 30,
    questionId: QUESTION_UUIDS[29],
    situation: "5回表・2アウト・走者なし、カウント 0-2",
    count: "カウント 0-2",
    choices: [
      { id: "a", text: "外角低めに逃げる球で打者を追い込む" },
      { id: "b", text: "真っ直ぐで勝負する" },
      { id: "c", text: "内角高めで抑える" },
      { id: "d", text: "フォークで決め球" },
    ],
    answerChoiceId: "a",
    explanation:
      "0-2・2アウト走者なしでは『外角低めに逃げる球』で打者を追い込むのがセオリー。ストライクゾーン外に振らせて空振り・凡打を狙う。",
    sourceLabel: "追い込み配球",
    sourceUrl: "https://ja.wikipedia.org/wiki/球種_(野球)",
    sourceType: "static",
    difficulty: 2,
  },
  // ---------- 追加 +10問（REAL_DATA 5 / THEORY 3 / KNOWLEDGE 2） ----------
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 33,
    questionId: QUESTION_UUIDS[32],
    situation:
      "2024年MLBで大谷翔平が打者として記録したOPSは、規定打席達成打者のうちリーグで何位だった？",
    count: "MLB 2024 / metric: OPS",
    choices: [
      { id: "a", text: "1位" },
      { id: "b", text: "3位以内" },
      { id: "c", text: "5位以内" },
      { id: "d", text: "10位以内" },
    ],
    answerChoiceId: "a",
    explanation:
      "実データ問題：2024年大谷翔平はOPSでナ・リーグ1位。出典：MLB.com / season 2024 / metric OPS。",
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
    id: 34,
    questionId: QUESTION_UUIDS[33],
    situation:
      "2024年MLBで山本由伸が記録した与四球率（BB/9）は、規定投球回達成投手のうちリーグで上位何位程度だった？",
    count: "MLB 2024 / metric: BB/9",
    choices: [
      { id: "a", text: "上位5位以内" },
      { id: "b", text: "上位10位以内" },
      { id: "c", text: "上位15位以内" },
      { id: "d", text: "20位以下" },
    ],
    answerChoiceId: "a",
    explanation:
      "実データ問題：2024年山本由伸は与四球率の低さでリーグ上位。出典：Baseball-Reference / season 2024 / metric BB/9。",
    sourceLabel: "Baseball-Reference",
    sourceUrl: "https://www.baseball-reference.com/players/y/yamamo01.shtml",
    sourceType: "data",
    difficulty: 4,
    season: 2024,
    metric: "BB/9",
    league: "MLB",
    source_url: "https://www.baseball-reference.com/players/y/yamamo01.shtml",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 35,
    questionId: QUESTION_UUIDS[34],
    situation:
      "2023年MLBのStatcastで、大谷翔平の「バレル率（Barrel%）」は打者全体で上位何％程度だった？",
    count: "MLB 2023 / metric: Barrel%",
    choices: [
      { id: "a", text: "上位5％" },
      { id: "b", text: "上位10％" },
      { id: "c", text: "上位20％" },
      { id: "d", text: "上位30％" },
    ],
    answerChoiceId: "a",
    explanation:
      "実データ問題：2023年大谷はBarrel%でリーグ上位。出典：Baseball Savant / season 2023 / metric Barrel%。",
    sourceLabel: "Baseball Savant",
    sourceUrl: "https://baseballsavant.mlb.com/leaderboard/statcast",
    sourceType: "data",
    difficulty: 4,
    season: 2023,
    metric: "Barrel%",
    league: "MLB",
    source_url: "https://baseballsavant.mlb.com/leaderboard/statcast",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 36,
    questionId: QUESTION_UUIDS[35],
    situation:
      "2024年MLBで今永昇太が記録した被打率（AVG）は、規定投球回達成投手のうちリーグで何位タイ程度だった？",
    count: "MLB 2024 / metric: 被打率",
    choices: [
      { id: "a", text: "上位3位以内" },
      { id: "b", text: "上位5位以内" },
      { id: "c", text: "上位10位以内" },
      { id: "d", text: "15位以下" },
    ],
    answerChoiceId: "a",
    explanation:
      "実データ問題：2024年今永昇太は被打率の低さでナ・リーグ上位。出典：MLB.com / season 2024 / metric AVG。",
    sourceLabel: "MLB.com",
    sourceUrl: "https://www.mlb.com/stats/pitching/2024",
    sourceType: "data",
    difficulty: 3,
    season: 2024,
    metric: "被打率",
    league: "MLB",
    source_url: "https://www.mlb.com/stats/pitching/2024",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 37,
    questionId: QUESTION_UUIDS[36],
    situation:
      "NPB公式記録によると、2024年パ・リーグで最多本塁打を記録した選手の所属チームは？",
    count: "NPB 2024 / metric: 本塁打",
    choices: [
      { id: "a", text: "ロッテ" },
      { id: "b", text: "ソフトバンク" },
      { id: "c", text: "西武" },
      { id: "d", text: "オリックス" },
    ],
    answerChoiceId: "a",
    explanation:
      "実データ問題：2024年パ・リーグ最多本塁打はロッテの選手。出典：NPB公式 / season 2024 / metric 本塁打。",
    sourceLabel: "NPB 公式",
    sourceUrl: "https://npb.jp/bis/2024/stats/bat_c.html",
    sourceType: "data",
    difficulty: 3,
    season: 2024,
    metric: "本塁打",
    league: "NPB",
    source_url: "https://npb.jp/bis/2024/stats/bat_c.html",
  },
  {
    kind: "definition",
    questionType: "THEORY",
    id: 38,
    questionId: QUESTION_UUIDS[37],
    situation: "3回裏・無死・1塁2塁、カウント 2-0",
    count: "カウント 2-0",
    choices: [
      { id: "a", text: "ストレートでストライクを取りにいく" },
      { id: "b", text: "変化球で様子見" },
      { id: "c", text: "敬遠して満塁" },
      { id: "d", text: "牽制で走者けん制" },
    ],
    answerChoiceId: "a",
    explanation:
      "2-0では『ストライクを取りにいく』のが基本。ボールを重ねると打者有利になるため、カウントを戻してから変化球を使う。",
    sourceLabel: "カウント別配球",
    sourceUrl: "https://ja.wikipedia.org/wiki/ボールカウント",
    sourceType: "static",
    difficulty: 2,
  },
  {
    kind: "definition",
    questionType: "THEORY",
    id: 39,
    questionId: QUESTION_UUIDS[38],
    situation: "9回表・2アウト・1塁、1点リード、カウント 1-2",
    count: "カウント 1-2",
    choices: [
      { id: "a", text: "外角低めのスライダーで空振り狙い" },
      { id: "b", text: "内角ストレートで勝負" },
      { id: "c", text: "敬遠して2塁" },
      { id: "d", text: "フォークで決め球" },
    ],
    answerChoiceId: "a",
    explanation:
      "1-2・2アウト1塁では『外角低めのスライダー』で空振りを狙うのが有効。打者は振りにいきやすく、外に逃げる球に手を出しやすい。",
    sourceLabel: "終盤の配球",
    sourceUrl: "https://ja.wikipedia.org/wiki/球種_(野球)",
    sourceType: "static",
    difficulty: 3,
  },
  {
    kind: "definition",
    questionType: "THEORY",
    id: 40,
    questionId: QUESTION_UUIDS[39],
    situation: "6回裏・1アウト・満塁、同点、カウント 2-2",
    count: "カウント 2-2",
    choices: [
      { id: "a", text: "フォークで空振り狙い" },
      { id: "b", text: "ストレートで内角攻め" },
      { id: "c", text: "敬遠して1点渡す" },
      { id: "d", text: "スライダーで外へ" },
    ],
    answerChoiceId: "a",
    explanation:
      "満塁同点の2-2では『フォークで空振り』を狙うのが有効。打者は待ちに回りにくく、空振り・凡打でダブルプレーも狙える。",
    sourceLabel: "危機的場面の配球",
    sourceUrl: "https://ja.wikipedia.org/wiki/フォークボール",
    sourceType: "static",
    difficulty: 4,
  },
];

/**
 * 追加 +10問 一覧（id / questionType / league / season / metric / sourceUrl）
 * -------------------------------------------------------------------------
 * 33  REAL_DATA  MLB  2024  OPS              https://www.mlb.com/stats/2024
 * 34  REAL_DATA  MLB  2024  BB/9              https://www.baseball-reference.com/players/y/yamamo01.shtml
 * 35  REAL_DATA  MLB  2023  Barrel%           https://baseballsavant.mlb.com/leaderboard/statcast
 * 36  REAL_DATA  MLB  2024  被打率            https://www.mlb.com/stats/pitching/2024
 * 37  REAL_DATA  NPB  2024  本塁打            https://npb.jp/bis/2024/stats/bat_c.html
 * 38  THEORY     —    —     —                 https://ja.wikipedia.org/wiki/ボールカウント
 * 39  THEORY     —    —     —                 https://ja.wikipedia.org/wiki/球種_(野球)
 * 40  THEORY     —    —     —                 https://ja.wikipedia.org/wiki/フォークボール
 * 41  KNOWLEDGE  —    —     —                 https://www.mlb.com/postseason
 * 42  KNOWLEDGE  —    —     —                 https://npb.jp/bis/2023/stats/pit_c.html
 * -------------------------------------------------------------------------
 */

/** 出題プール用: id で指定した問題を順に返す */
function pickByIds(pool: Question[], ids: readonly number[]): Question[] {
  return ids
    .map((id) => pool.find((q) => q.id === id))
    .filter((q): q is Question => q != null);
}

/** 実データ問題プール（15問）。questionType は REAL_DATA で明示。5:3:2 維持のため拡張。 */
const REAL_DATA_POOL: Question[] = pickByIds(QUESTIONS_POOL, [11, 12, 14, 15, 18, 23, 24, 25, 26, 27, 33, 34, 35, 36, 37]);

/** 配球セオリー問題プール（9問）。questionType は THEORY で明示。5:3:2 維持のため拡張。 */
const THEORY_POOL: Question[] = pickByIds(QUESTIONS_POOL, [1, 4, 7, 28, 29, 30, 38, 39, 40]);

/** 知識問題プール（6問）。questionType は KNOWLEDGE で明示。5:3:2 維持のため拡張。 */
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
  {
    kind: "definition",
    questionType: "KNOWLEDGE",
    id: 31,
    questionId: QUESTION_UUIDS[30],
    situation: "2024年NPBでセ・リーグ優勝した球団は？",
    count: "知識問題",
    choices: [
      { id: "a", text: "巨人" },
      { id: "b", text: "ヤクルト" },
      { id: "c", text: "DeNA" },
      { id: "d", text: "広島" },
    ],
    answerChoiceId: "a",
    explanation: "2024年セ・リーグ優勝は読売巨人軍です。",
    sourceLabel: "NPB公式",
    sourceUrl: "https://npb.jp",
    sourceType: "static",
    difficulty: 1,
  },
  {
    kind: "definition",
    questionType: "KNOWLEDGE",
    id: 32,
    questionId: QUESTION_UUIDS[31],
    situation: "2024年MLBでナ・リーグ西地区優勝した球団は？",
    count: "知識問題",
    choices: [
      { id: "a", text: "ドジャース" },
      { id: "b", text: "パドレス" },
      { id: "c", text: "ダイヤモンドバックス" },
      { id: "d", text: "ジャイアンツ" },
    ],
    answerChoiceId: "a",
    explanation: "2024年ナ・リーグ西地区優勝はロサンゼルス・ドジャースです。",
    sourceLabel: "MLB公式",
    sourceUrl: "https://www.mlb.com",
    sourceType: "static",
    difficulty: 2,
  },
  {
    kind: "definition",
    questionType: "KNOWLEDGE",
    id: 41,
    questionId: QUESTION_UUIDS[40],
    situation: "2024年MLBでワールドシリーズ優勝した球団は？",
    count: "知識問題",
    choices: [
      { id: "a", text: "ロイヤルズ" },
      { id: "b", text: "オリオールズ" },
      { id: "c", text: "ドジャース" },
      { id: "d", text: "ダイヤモンドバックス" },
    ],
    answerChoiceId: "a",
    explanation: "2024年はカンザスシティ・ロイヤルズが優勝しました。",
    sourceLabel: "MLB公式",
    sourceUrl: "https://www.mlb.com/postseason",
    sourceType: "static",
    difficulty: 2,
  },
  {
    kind: "definition",
    questionType: "KNOWLEDGE",
    id: 42,
    questionId: QUESTION_UUIDS[41],
    situation: "2023年NPBでパ・リーグ最多勝を記録した投手の所属チームは？",
    count: "知識問題",
    choices: [
      { id: "a", text: "オリックス" },
      { id: "b", text: "ロッテ" },
      { id: "c", text: "ソフトバンク" },
      { id: "d", text: "西武" },
    ],
    answerChoiceId: "a",
    explanation: "2023年パ・リーグ最多勝はオリックスの山本由伸（当時）です。",
    sourceLabel: "NPB公式",
    sourceUrl: "https://npb.jp/bis/2023/stats/pit_c.html",
    sourceType: "static",
    difficulty: 2,
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
