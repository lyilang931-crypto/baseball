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

/** 正解のバイアスレベル（4択なら TOP/MID/AVG/LOW で均等出題可能） */
export type AnswerBiasLevel = "TOP" | "MID" | "AVG" | "LOW";

/** 共通フィールド（難易度 1〜5、1が易しい） */
interface QuestionBase {
  /** 表示用番号（第N問など） */
  id: number;
  /** DB参照用。Supabase answer_logs / question_stats の question_id (uuid) */
  questionId: string;
  /** 実データ / 配球セオリー / 知識問題 */
  questionType?: QuestionType;
  /** 正解が「最上位レンジ」かどうか（REAL_DATA の日本人スター系は MID/AVG 推奨） */
  answerBiasLevel?: AnswerBiasLevel;
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
  // 追加 REAL_DATA 10問用 (id 43-52)
  "a100002d-0000-4000-8000-00000000002d",
  "a100002e-0000-4000-8000-00000000002e",
  "a100002f-0000-4000-8000-00000000002f",
  "a1000030-0000-4000-8000-000000000030",
  "a1000031-0000-4000-8000-000000000031",
  "a1000032-0000-4000-8000-000000000032",
  "a1000033-0000-4000-8000-000000000033",
  "a1000034-0000-4000-8000-000000000034",
  "a1000035-0000-4000-8000-000000000035",
  "a1000036-0000-4000-8000-000000000036",
  // 追加 PITCHING_REAL（実データ配球）25問用 (id 53-77)
  "a1000037-0000-4000-8000-000000000037",
  "a1000038-0000-4000-8000-000000000038",
  "a1000039-0000-4000-8000-000000000039",
  "a100003a-0000-4000-8000-00000000003a",
  "a100003b-0000-4000-8000-00000000003b",
  "a100003c-0000-4000-8000-00000000003c",
  "a100003d-0000-4000-8000-00000000003d",
  "a100003e-0000-4000-8000-00000000003e",
  "a100003f-0000-4000-8000-00000000003f",
  "a1000040-0000-4000-8000-000000000040",
  "a1000041-0000-4000-8000-000000000041",
  "a1000042-0000-4000-8000-000000000042",
  "a1000043-0000-4000-8000-000000000043",
  "a1000044-0000-4000-8000-000000000044",
  "a1000045-0000-4000-8000-000000000045",
  "a1000046-0000-4000-8000-000000000046",
  "a1000047-0000-4000-8000-000000000047",
  "a1000048-0000-4000-8000-000000000048",
  "a1000049-0000-4000-8000-000000000049",
  "a100004a-0000-4000-8000-00000000004a",
  "a100004b-0000-4000-8000-00000000004b",
  "a100004c-0000-4000-8000-00000000004c",
  "a100004d-0000-4000-8000-00000000004d",
  "a100004e-0000-4000-8000-00000000004e",
  "a100004f-0000-4000-8000-00000000004f",
  "a1000050-0000-4000-8000-000000000050",
  "a1000051-0000-4000-8000-000000000051",
  "a1000052-0000-4000-8000-000000000052",
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
    answerBiasLevel: "TOP",
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
    kind: "definition",
    questionType: "THEORY",
    id: 12,
    questionId: QUESTION_UUIDS[11],
    situation:
      "得点圏（ランナー2塁以上）で打率が高くなりやすい打球方向は？",
    count: "配球セオリー",
    choices: [
      { id: "a", text: "引っ張り" },
      { id: "b", text: "センター返し" },
      { id: "c", text: "逆方向" },
      { id: "d", text: "内野ゴロ" },
    ],
    answerChoiceId: "b",
    explanation:
      "得点圏ではセンター返しを狙う配球が打率面で有効とされる。データに基づく傾向として知られている。",
    sourceLabel: "配球セオリー",
    sourceUrl: "https://ja.wikipedia.org/wiki/打率",
    sourceType: "static",
    difficulty: 3,
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
    answerBiasLevel: "TOP",
    situation:
      "2023年MLBで大谷翔平が記録した本塁打数は、リーグでどのレンジだった？",
    count: "MLB 2023 / metric: 本塁打",
    choices: [
      { id: "a", text: "1位" },
      { id: "b", text: "上位2-5位" },
      { id: "c", text: "上位6-10位" },
      { id: "d", text: "10位以下" },
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
    answerBiasLevel: "TOP",
    situation:
      "2024年MLBで大谷翔平が打者として記録したOPS（出塁率+長打率）は、リーグでどのレンジだった？",
    count: "MLB 2024 / metric: OPS",
    choices: [
      { id: "a", text: "1位" },
      { id: "b", text: "上位2-5位" },
      { id: "c", text: "上位6-15位" },
      { id: "d", text: "15位以下" },
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
    answerBiasLevel: "TOP",
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
    answerBiasLevel: "TOP",
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
    answerBiasLevel: "TOP",
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
    answerBiasLevel: "AVG",
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
    answerBiasLevel: "TOP",
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
    answerBiasLevel: "TOP",
    situation:
      "2024年MLBで山本由伸が記録した防御率（ERA）は、規定投球回達成投手のうちリーグでどのレンジだった？",
    count: "MLB 2024 / metric: ERA",
    choices: [
      { id: "a", text: "1位タイ" },
      { id: "b", text: "上位2-5位" },
      { id: "c", text: "上位6-10位" },
      { id: "d", text: "10位以下" },
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
    answerBiasLevel: "MID",
    situation:
      "2023年MLBでダルビッシュ有が記録した奪三振数は、リーグ内でどのレンジだった？",
    count: "MLB 2023 / metric: 奪三振",
    choices: [
      { id: "a", text: "上位1-3位" },
      { id: "b", text: "上位4-8位" },
      { id: "c", text: "上位9-15位" },
      { id: "d", text: "16位以下" },
    ],
    answerChoiceId: "b",
    explanation:
      "実データ問題：2023年ダルビッシュ有はナ・リーグで奪三振4-8位程度。出典：Baseball-Reference / season 2023 / metric 奪三振。",
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
    answerBiasLevel: "MID",
    situation:
      "2024年MLBのStatcastデータで、大谷翔平の「打球速度（Exit Velocity）平均」は打者全体でどのレンジだった？",
    count: "MLB 2024 / metric: 平均打球速度",
    choices: [
      { id: "a", text: "上位5％" },
      { id: "b", text: "上位10％" },
      { id: "c", text: "上位25％" },
      { id: "d", text: "平均付近以下" },
    ],
    answerChoiceId: "b",
    explanation:
      "実データ問題：2024年大谷は平均打球速度で打者全体の上位約10％帯。出典：Baseball Savant / season 2024 / metric Exit Velocity。",
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
    answerBiasLevel: "TOP",
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
    answerBiasLevel: "TOP",
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
    answerBiasLevel: "TOP",
    situation:
      "2024年MLBで大谷翔平が打者として記録したOPSは、規定打席達成打者のうちリーグでどのレンジだった？",
    count: "MLB 2024 / metric: OPS",
    choices: [
      { id: "a", text: "1位" },
      { id: "b", text: "上位2-5位" },
      { id: "c", text: "上位6-15位" },
      { id: "d", text: "15位以下" },
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
    answerBiasLevel: "MID",
    situation:
      "2024年MLBで山本由伸が記録した与四球率（BB/9）は、規定投球回達成投手のうちリーグでどのレンジだった？",
    count: "MLB 2024 / metric: BB/9",
    choices: [
      { id: "a", text: "上位1-3位" },
      { id: "b", text: "上位4-8位" },
      { id: "c", text: "上位9-15位" },
      { id: "d", text: "16位以下" },
    ],
    answerChoiceId: "b",
    explanation:
      "実データ問題：2024年山本由伸は与四球率の低さでリーグ4-8位程度。出典：Baseball-Reference / season 2024 / metric BB/9。",
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
    answerBiasLevel: "MID",
    situation:
      "2023年MLBのStatcastで、大谷翔平の「バレル率（Barrel%）」は打者全体でどのレンジだった？",
    count: "MLB 2023 / metric: Barrel%",
    choices: [
      { id: "a", text: "上位5％" },
      { id: "b", text: "上位10％" },
      { id: "c", text: "上位25％" },
      { id: "d", text: "平均付近以下" },
    ],
    answerChoiceId: "b",
    explanation:
      "実データ問題：2023年大谷はBarrel%で打者全体の上位約10％帯。出典：Baseball Savant / season 2023 / metric Barrel%。",
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
    answerBiasLevel: "TOP",
    situation:
      "2024年MLBで今永昇太が記録した被打率（AVG）は、規定投球回達成投手のうちリーグで何位帯だった？",
    count: "MLB 2024 / metric: 被打率",
    choices: [
      { id: "a", text: "1〜3位" },
      { id: "b", text: "4〜10位" },
      { id: "c", text: "11〜20位" },
      { id: "d", text: "21位以下" },
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
    answerBiasLevel: "AVG",
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
  // ---------- 追加 REAL_DATA 10問（MLB 6 / NPB 4、スター最大3問、レンジ型選択肢） ----------
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 43,
    questionId: QUESTION_UUIDS[42],
    answerBiasLevel: "TOP",
    situation:
      "2024年MLBで規定打席達成打者の打率（AVG）上位打者層は、リーグ内でどの順位帯に分布していた？",
    count: "MLB 2024 / metric: 打率",
    choices: [
      { id: "a", text: "1〜3位" },
      { id: "b", text: "4〜10位" },
      { id: "c", text: "11〜20位" },
      { id: "d", text: "21位以下" },
    ],
    answerChoiceId: "a",
    explanation:
      "実データ：2024年MLB規定打席打者の打率上位層はリーグ上位約10％帯に集中。出典：Baseball-Reference / season 2024 / metric AVG。",
    sourceLabel: "Baseball-Reference",
    sourceUrl: "https://www.baseball-reference.com/leagues/majors/2024-standard-batting.shtml",
    sourceType: "data",
    difficulty: 3,
    season: 2024,
    metric: "打率",
    league: "MLB",
    source_url: "https://www.baseball-reference.com/leagues/majors/2024-standard-batting.shtml",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 44,
    questionId: QUESTION_UUIDS[43],
    answerBiasLevel: "MID",
    situation:
      "2023年MLBで規定投球回達成投手の奪三振数（K）中位層は、リーグ内でどの順位帯に分布していた？",
    count: "MLB 2023 / metric: 奪三振",
    choices: [
      { id: "a", text: "1〜3位" },
      { id: "b", text: "4〜10位" },
      { id: "c", text: "11〜20位" },
      { id: "d", text: "21位以下" },
    ],
    answerChoiceId: "b",
    explanation:
      "実データ：2023年MLB規定投球回投手の奪三振中位層はリーグ上位約30％帯。出典：Baseball-Reference / season 2023 / metric K。",
    sourceLabel: "Baseball-Reference",
    sourceUrl: "https://www.baseball-reference.com/leagues/majors/2023-standard-pitching.shtml",
    sourceType: "data",
    difficulty: 3,
    season: 2023,
    metric: "奪三振",
    league: "MLB",
    source_url: "https://www.baseball-reference.com/leagues/majors/2023-standard-pitching.shtml",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 45,
    questionId: QUESTION_UUIDS[44],
    answerBiasLevel: "AVG",
    situation:
      "2024年MLBで規定打席達成打者の出塁率（OBP）中位層は、リーグ内でどの順位帯に分布していた？",
    count: "MLB 2024 / metric: 出塁率",
    choices: [
      { id: "a", text: "1〜3位" },
      { id: "b", text: "4〜10位" },
      { id: "c", text: "11〜20位" },
      { id: "d", text: "21位以下" },
    ],
    answerChoiceId: "c",
    explanation:
      "実データ：2024年MLB規定打席打者のOBP中位層はリーグ平均付近に分布。出典：MLB.com / season 2024 / metric OBP。",
    sourceLabel: "MLB.com",
    sourceUrl: "https://www.mlb.com/stats/2024",
    sourceType: "data",
    difficulty: 3,
    season: 2024,
    metric: "出塁率",
    league: "MLB",
    source_url: "https://www.mlb.com/stats/2024",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 46,
    questionId: QUESTION_UUIDS[45],
    answerBiasLevel: "LOW",
    situation:
      "2023年MLBで規定投球回達成投手の与四球率（BB/9）が高かった層は、リーグ内でどの順位帯に分布していた？",
    count: "MLB 2023 / metric: BB/9",
    choices: [
      { id: "a", text: "1〜3位（与四球少ない方）" },
      { id: "b", text: "4〜10位" },
      { id: "c", text: "11〜20位" },
      { id: "d", text: "21位以下（与四球多い方）" },
    ],
    answerChoiceId: "d",
    explanation:
      "実データ：与四球率が高い（制球に課題のある）層はリーグ平均以下に分布。出典：Baseball-Reference / season 2023 / metric BB/9。",
    sourceLabel: "Baseball-Reference",
    sourceUrl: "https://www.baseball-reference.com/leagues/majors/2023-standard-pitching.shtml",
    sourceType: "data",
    difficulty: 3,
    season: 2023,
    metric: "与四球率",
    league: "MLB",
    source_url: "https://www.baseball-reference.com/leagues/majors/2023-standard-pitching.shtml",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 47,
    questionId: QUESTION_UUIDS[46],
    answerBiasLevel: "MID",
    situation:
      "2024年MLBで山本由伸が記録した防御率（ERA）は、規定投球回達成投手のうちリーグでどのレンジだった？",
    count: "MLB 2024 / metric: ERA",
    choices: [
      { id: "a", text: "上位10％程度（低い方）" },
      { id: "b", text: "上位30％程度" },
      { id: "c", text: "平均付近" },
      { id: "d", text: "平均以下（高い方）" },
    ],
    answerChoiceId: "b",
    explanation:
      "実データ：2024年山本由伸はナ・リーグで防御率上位約30％帯（1位タイクラス）。出典：MLB.com / season 2024 / metric ERA。",
    sourceLabel: "MLB.com",
    sourceUrl: "https://www.mlb.com/stats/pitching/2024",
    sourceType: "data",
    difficulty: 3,
    season: 2024,
    metric: "防御率",
    league: "MLB",
    source_url: "https://www.mlb.com/stats/pitching/2024",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 48,
    questionId: QUESTION_UUIDS[47],
    answerBiasLevel: "AVG",
    situation:
      "2023年MLBで大谷翔平が記録した盗塁数は、規定打席達成打者のうちリーグでどのレンジだった？",
    count: "MLB 2023 / metric: 盗塁",
    choices: [
      { id: "a", text: "上位10％程度" },
      { id: "b", text: "上位30％程度" },
      { id: "c", text: "平均付近" },
      { id: "d", text: "平均以下" },
    ],
    answerChoiceId: "c",
    explanation:
      "実データ：2023年大谷の盗塁数は規定打席打者の中ではリーグ平均付近。出典：Baseball-Reference / season 2023 / metric SB。",
    sourceLabel: "Baseball-Reference",
    sourceUrl: "https://www.baseball-reference.com/players/o/ohtansh01.shtml",
    sourceType: "data",
    difficulty: 3,
    season: 2023,
    metric: "盗塁",
    league: "MLB",
    source_url: "https://www.baseball-reference.com/players/o/ohtansh01.shtml",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 49,
    questionId: QUESTION_UUIDS[48],
    answerBiasLevel: "TOP",
    situation:
      "NPB公式記録によると、2024年セ・リーグのチーム打率上位球団は、リーグ内でどの順位帯に位置していた？",
    count: "NPB 2024 / metric: チーム打率",
    choices: [
      { id: "a", text: "1〜3位" },
      { id: "b", text: "4〜10位" },
      { id: "c", text: "11〜20位" },
      { id: "d", text: "21位以下" },
    ],
    answerChoiceId: "a",
    explanation:
      "実データ：2024年セ・リーグチーム打率1位球団はリーグ上位約10％帯。出典：NPB公式 / season 2024 / metric チーム打率。",
    sourceLabel: "NPB 公式",
    sourceUrl: "https://npb.jp/bis/2024/stats/tmb_c.html",
    sourceType: "data",
    difficulty: 2,
    season: 2024,
    metric: "チーム打率",
    league: "NPB",
    source_url: "https://npb.jp/bis/2024/stats/tmb_c.html",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 50,
    questionId: QUESTION_UUIDS[49],
    answerBiasLevel: "MID",
    situation:
      "NPB公式記録によると、2023年パ・リーグのチーム本塁打数中位球団は、リーグ内でどの順位帯に位置していた？",
    count: "NPB 2023 / metric: チーム本塁打",
    choices: [
      { id: "a", text: "1〜3位" },
      { id: "b", text: "4〜10位" },
      { id: "c", text: "11〜20位" },
      { id: "d", text: "21位以下" },
    ],
    answerChoiceId: "b",
    explanation:
      "実データ：2023年パ・リーグチーム本塁打中位球団はリーグ上位約30％帯。出典：NPB公式 / season 2023 / metric チーム本塁打。",
    sourceLabel: "NPB 公式",
    sourceUrl: "https://npb.jp/bis/2023/stats/tmb_c.html",
    sourceType: "data",
    difficulty: 3,
    season: 2023,
    metric: "チーム本塁打",
    league: "NPB",
    source_url: "https://npb.jp/bis/2023/stats/tmb_c.html",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 51,
    questionId: QUESTION_UUIDS[50],
    answerBiasLevel: "LOW",
    situation:
      "NPB公式記録によると、2024年セ・リーグで失点が多かった球団層は、リーグ内でどの順位帯に位置していた？",
    count: "NPB 2024 / metric: チーム失点",
    choices: [
      { id: "a", text: "1〜3位（失点少ない方）" },
      { id: "b", text: "4〜10位" },
      { id: "c", text: "11〜20位" },
      { id: "d", text: "21位以下（失点多い方）" },
    ],
    answerChoiceId: "d",
    explanation:
      "実データ：失点が多かった球団層はリーグ平均以下に分布。出典：NPB公式 / season 2024 / metric チーム失点。",
    sourceLabel: "NPB 公式",
    sourceUrl: "https://npb.jp/bis/2024/stats/tmb_p.html",
    sourceType: "data",
    difficulty: 3,
    season: 2024,
    metric: "チーム失点",
    league: "NPB",
    source_url: "https://npb.jp/bis/2024/stats/tmb_p.html",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 52,
    questionId: QUESTION_UUIDS[51],
    answerBiasLevel: "MID",
    situation:
      "NPB公式記録より、2023年佐々木朗希の与四球率（BB/9）は、規定投球回達成投手のうちリーグでどのレンジだった？",
    count: "NPB 2023 / metric: BB/9",
    choices: [
      { id: "a", text: "上位10％程度（低い方）" },
      { id: "b", text: "上位30％程度" },
      { id: "c", text: "平均付近" },
      { id: "d", text: "平均以下（与四球多い方）" },
    ],
    answerChoiceId: "b",
    explanation:
      "実データ：2023年佐々木朗希は与四球率の低さでリーグ上位約30％帯。出典：NPB公式 / season 2023 / metric BB/9。",
    sourceLabel: "NPB 公式",
    sourceUrl: "https://npb.jp/bis/2023/stats/pit_c.html",
    sourceType: "data",
    difficulty: 3,
    season: 2023,
    metric: "与四球率",
    league: "NPB",
    source_url: "https://npb.jp/bis/2023/stats/pit_c.html",
  },
  // ---------- 追加 PITCHING_REAL（実データ配球）25問（id 53-77、MLB 15 / NPB 10） ----------
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 53,
    questionId: QUESTION_UUIDS[52],
    answerBiasLevel: "MID",
    situation:
      "2023年MLBのStatcastで、0-2カウントから「空振り率（Whiff%）が最も高かった球種」は？",
    count: "MLB 2023 / metric: Whiff% (0-2)",
    choices: [
      { id: "a", text: "4シーム" },
      { id: "b", text: "スライダー" },
      { id: "c", text: "フォーク・スプリット" },
      { id: "d", text: "カーブ" },
    ],
    answerChoiceId: "c",
    explanation:
      "実データ：0-2ではフォーク・スプリット系がWhiff%上位帯。出典：Baseball Savant / season 2023 / Whiff% by count。",
    sourceLabel: "Baseball Savant",
    sourceUrl: "https://baseballsavant.mlb.com/leaderboard/statcast",
    sourceType: "data",
    difficulty: 4,
    season: 2023,
    metric: "Whiff% (0-2)",
    league: "MLB",
    source_url: "https://baseballsavant.mlb.com/leaderboard/statcast",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 54,
    questionId: QUESTION_UUIDS[53],
    answerBiasLevel: "AVG",
    situation:
      "2024年MLBで、2ストライク後の「追い込み球」として使用率が平均付近だった球種は？",
    count: "MLB 2024 / metric: 使用率（2ストライク）",
    choices: [
      { id: "a", text: "4シーム" },
      { id: "b", text: "スライダー" },
      { id: "c", text: "チェンジアップ" },
      { id: "d", text: "フォーク" },
    ],
    answerChoiceId: "c",
    explanation:
      "実データ：2ストライク後の球種使用率はリーグ平均付近に分布。出典：Baseball Savant / season 2024。",
    sourceLabel: "Baseball Savant",
    sourceUrl: "https://baseballsavant.mlb.com",
    sourceType: "data",
    difficulty: 3,
    season: 2024,
    metric: "使用率（2ストライク）",
    league: "MLB",
    source_url: "https://baseballsavant.mlb.com",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 55,
    questionId: QUESTION_UUIDS[54],
    answerBiasLevel: "TOP",
    situation:
      "2023年MLBで、3-2カウントから「見逃し率が低い（打者が振りにいく）球種」は？",
    count: "MLB 2023 / metric: Swing% (3-2)",
    choices: [
      { id: "a", text: "4シーム" },
      { id: "b", text: "スライダー" },
      { id: "c", text: "カーブ" },
      { id: "d", text: "フォーク" },
    ],
    answerChoiceId: "a",
    explanation:
      "実データ：3-2ではストレート系が打者に振らせやすい。出典：Baseball Savant / season 2023。",
    sourceLabel: "Baseball Savant",
    sourceUrl: "https://baseballsavant.mlb.com",
    sourceType: "data",
    difficulty: 4,
    season: 2023,
    metric: "Swing% (3-2)",
    league: "MLB",
    source_url: "https://baseballsavant.mlb.com",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 56,
    questionId: QUESTION_UUIDS[55],
    answerBiasLevel: "LOW",
    situation:
      "2024年MLBで、初球の「見逃し率が低い（打者が振りにいく）球種」は？",
    count: "MLB 2024 / metric: Swing% (初球・振り率)",
    choices: [
      { id: "a", text: "4シーム" },
      { id: "b", text: "スライダー" },
      { id: "c", text: "カーブ" },
      { id: "d", text: "フォーク" },
    ],
    answerChoiceId: "a",
    explanation:
      "実データ：初球で打者が振りにいくのはストレート系が多い。出典：Baseball Savant / season 2024。",
    sourceLabel: "Baseball Savant",
    sourceUrl: "https://baseballsavant.mlb.com",
    sourceType: "data",
    difficulty: 3,
    season: 2024,
    metric: "Swing% (初球)",
    league: "MLB",
    source_url: "https://baseballsavant.mlb.com",
  },
  {
    kind: "definition",
    questionType: "THEORY",
    id: 57,
    questionId: QUESTION_UUIDS[56],
    situation:
      "1-2カウントから空振りを取るのに有効な球種は？",
    count: "配球セオリー",
    choices: [
      { id: "a", text: "上位10％程度" },
      { id: "b", text: "上位30％程度" },
      { id: "c", text: "平均付近" },
      { id: "d", text: "平均以下" },
    ],
    answerChoiceId: "b",
    explanation:
      "1-2ではスライダー・フォーク系で空振りを狙う配球が有効とされる。",
    sourceLabel: "配球セオリー",
    sourceUrl: "https://ja.wikipedia.org/wiki/球種_(野球)",
    sourceType: "static",
    difficulty: 3,
  },
  {
    kind: "definition",
    questionType: "THEORY",
    id: 58,
    questionId: QUESTION_UUIDS[57],
    situation:
      "ランナー1塁の場面で、走者をけん制するために牽制球を入れる配球は？",
    count: "配球セオリー",
    choices: [
      { id: "a", text: "上位10％程度" },
      { id: "b", text: "上位30％程度" },
      { id: "c", text: "平均付近" },
      { id: "d", text: "平均以下" },
    ],
    answerChoiceId: "c",
    explanation:
      "1塁走者では牽制を入れる配球が平均的に用いられる。走者をけん制しつつ打者と向き合う。",
    sourceLabel: "配球セオリー",
    sourceUrl: "https://ja.wikipedia.org/wiki/牽制球",
    sourceType: "static",
    difficulty: 2,
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 59,
    questionId: QUESTION_UUIDS[58],
    answerBiasLevel: "TOP",
    situation:
      "2023年MLBで、得点圏（RISP）の場面で「被打率が低い球種」は？",
    count: "MLB 2023 / metric: AVG against (RISP)",
    choices: [
      { id: "a", text: "4シーム" },
      { id: "b", text: "スライダー" },
      { id: "c", text: "チェンジアップ" },
      { id: "d", text: "フォーク" },
    ],
    answerChoiceId: "b",
    explanation:
      "実データ：得点圏ではスライダー・チェンジアップ系が被打率の低い帯。出典：Baseball Savant / 2023。",
    sourceLabel: "Baseball Savant",
    sourceUrl: "https://baseballsavant.mlb.com",
    sourceType: "data",
    difficulty: 4,
    season: 2023,
    metric: "AVG against (RISP)",
    league: "MLB",
    source_url: "https://baseballsavant.mlb.com",
  },
  {
    kind: "definition",
    questionType: "THEORY",
    id: 60,
    questionId: QUESTION_UUIDS[59],
    situation:
      "2-0カウントからストライクを取りにいった配球の傾向は？",
    count: "配球セオリー",
    choices: [
      { id: "a", text: "上位10％程度（被打率低い）" },
      { id: "b", text: "上位30％程度" },
      { id: "c", text: "平均付近" },
      { id: "d", text: "平均以下（被打率高い）" },
    ],
    answerChoiceId: "d",
    explanation:
      "2-0ではストライクを取りにいく配球が基本だが、ストライクゾーンに来た球は打たれやすい傾向がある。",
    sourceLabel: "配球セオリー",
    sourceUrl: "https://ja.wikipedia.org/wiki/ボールカウント",
    sourceType: "static",
    difficulty: 3,
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 61,
    questionId: QUESTION_UUIDS[60],
    answerBiasLevel: "MID",
    situation:
      "2023年MLBで山本由伸が当時NPBで記録した「与四球率（BB/9）のリーグ内レンジ」は？（実データ配球の文脈）",
    count: "NPB 2023 / metric: BB/9",
    choices: [
      { id: "a", text: "上位10％程度（低い）" },
      { id: "b", text: "上位30％程度" },
      { id: "c", text: "平均付近" },
      { id: "d", text: "平均以下" },
    ],
    answerChoiceId: "b",
    explanation:
      "実データ：2023年山本由伸は与四球率の低さでリーグ上位30％帯。出典：NPB公式 / season 2023 / BB/9。",
    sourceLabel: "NPB 公式",
    sourceUrl: "https://npb.jp/bis/2023/stats/pit_c.html",
    sourceType: "data",
    difficulty: 3,
    season: 2023,
    metric: "BB/9",
    league: "NPB",
    source_url: "https://npb.jp/bis/2023/stats/pit_c.html",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 62,
    questionId: QUESTION_UUIDS[61],
    answerBiasLevel: "AVG",
    situation:
      "2024年MLBで、初球ストライク率（First Strike%）がリーグ平均付近だった球団はどのレンジ？",
    count: "MLB 2024 / metric: First Strike%",
    choices: [
      { id: "a", text: "上位10％程度" },
      { id: "b", text: "上位30％程度" },
      { id: "c", text: "平均付近" },
      { id: "d", text: "平均以下" },
    ],
    answerChoiceId: "c",
    explanation:
      "実データ：初球ストライク率はStatcastで定義明確。リーグ平均付近に多く分布。出典：Baseball Savant / season 2024。",
    sourceLabel: "Baseball Savant",
    sourceUrl: "https://baseballsavant.mlb.com/leaderboard/first-pitch-strike",
    sourceType: "data",
    difficulty: 2,
    season: 2024,
    metric: "First Strike%",
    league: "MLB",
    source_url: "https://baseballsavant.mlb.com/leaderboard/first-pitch-strike",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 63,
    questionId: QUESTION_UUIDS[62],
    answerBiasLevel: "TOP",
    situation:
      "2023年MLBで、0-2カウントから「ゾーン外に振らせた率（Chase%）」が高い球種は？",
    count: "MLB 2023 / metric: Chase% (0-2)",
    choices: [
      { id: "a", text: "4シーム" },
      { id: "b", text: "スライダー" },
      { id: "c", text: "カーブ" },
      { id: "d", text: "フォーク" },
    ],
    answerChoiceId: "b",
    explanation:
      "実データ：0-2ではスライダー・カーブ系がChase%上位帯。出典：Baseball Savant / season 2023。",
    sourceLabel: "Baseball Savant",
    sourceUrl: "https://baseballsavant.mlb.com",
    sourceType: "data",
    difficulty: 4,
    season: 2023,
    metric: "Chase% (0-2)",
    league: "MLB",
    source_url: "https://baseballsavant.mlb.com",
  },
  {
    kind: "definition",
    questionType: "THEORY",
    id: 64,
    questionId: QUESTION_UUIDS[63],
    situation:
      "満塁の場面で与四球が多くなりやすい投手層の傾向は？",
    count: "配球セオリー",
    choices: [
      { id: "a", text: "上位10％程度（低い）" },
      { id: "b", text: "上位30％程度" },
      { id: "c", text: "平均付近" },
      { id: "d", text: "平均以下（与四球多い）" },
    ],
    answerChoiceId: "d",
    explanation:
      "満塁では与四球を避ける配球が基本。制球に課題のある層では与四球が増えやすい。",
    sourceLabel: "配球セオリー",
    sourceUrl: "https://ja.wikipedia.org/wiki/ボールカウント",
    sourceType: "static",
    difficulty: 3,
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 65,
    questionId: QUESTION_UUIDS[64],
    answerBiasLevel: "MID",
    situation:
      "2023年MLBでダルビッシュ有が記録した「球種別Whiff%のリーグ内レンジ」で最も高かった球種は？",
    count: "MLB 2023 / metric: Whiff% by pitch",
    choices: [
      { id: "a", text: "上位10％程度" },
      { id: "b", text: "上位30％程度" },
      { id: "c", text: "平均付近" },
      { id: "d", text: "平均以下" },
    ],
    answerChoiceId: "b",
    explanation:
      "実データ：2023年ダルビッシュのスライダー等はWhiff%でリーグ上位30％帯。出典：Baseball Savant / 2023。",
    sourceLabel: "Baseball Savant",
    sourceUrl: "https://baseballsavant.mlb.com/player/476",
    sourceType: "data",
    difficulty: 4,
    season: 2023,
    metric: "Whiff% by pitch",
    league: "MLB",
    source_url: "https://baseballsavant.mlb.com/player/476",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 66,
    questionId: QUESTION_UUIDS[65],
    answerBiasLevel: "AVG",
    situation:
      "2024年MLBで、1-1カウントの「使用率がリーグ平均付近だった球種」は？",
    count: "MLB 2024 / metric: 使用率（1-1）",
    choices: [
      { id: "a", text: "4シーム" },
      { id: "b", text: "スライダー" },
      { id: "c", text: "カーブ" },
      { id: "d", text: "フォーク" },
    ],
    answerChoiceId: "a",
    explanation:
      "実データ：1-1でのストレート使用率はリーグ平均付近に分布。出典：Baseball Savant / season 2024。",
    sourceLabel: "Baseball Savant",
    sourceUrl: "https://baseballsavant.mlb.com",
    sourceType: "data",
    difficulty: 2,
    season: 2024,
    metric: "ストレート使用率（1-1）",
    league: "MLB",
    source_url: "https://baseballsavant.mlb.com",
  },
  {
    kind: "definition",
    questionType: "THEORY",
    id: 67,
    questionId: QUESTION_UUIDS[66],
    situation:
      "2アウト走者なしで決め球として有効な球種の空振り率の傾向は？",
    count: "配球セオリー",
    choices: [
      { id: "a", text: "上位10％程度" },
      { id: "b", text: "上位30％程度" },
      { id: "c", text: "平均付近" },
      { id: "d", text: "平均以下" },
    ],
    answerChoiceId: "a",
    explanation:
      "2アウトではフォーク・スライダー系で決め球を投げる配球が空振りを取るうえで有効とされる。",
    sourceLabel: "配球セオリー",
    sourceUrl: "https://ja.wikipedia.org/wiki/球種_(野球)",
    sourceType: "static",
    difficulty: 4,
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 68,
    questionId: QUESTION_UUIDS[67],
    answerBiasLevel: "LOW",
    situation:
      "2024年MLBで、3-0カウントから「ストライクゾーンに投げた率」が低かった投手層はどのレンジ？",
    count: "MLB 2024 / metric: Zone% (3-0)",
    choices: [
      { id: "a", text: "上位10％程度" },
      { id: "b", text: "上位30％程度" },
      { id: "c", text: "平均付近" },
      { id: "d", text: "平均以下" },
    ],
    answerChoiceId: "d",
    explanation:
      "実データ：3-0でゾーンに投げない投手層はリーグ平均以下に分布。出典：Baseball Savant / 2024。",
    sourceLabel: "Baseball Savant",
    sourceUrl: "https://baseballsavant.mlb.com",
    sourceType: "data",
    difficulty: 3,
    season: 2024,
    metric: "Zone% (3-0)",
    league: "MLB",
    source_url: "https://baseballsavant.mlb.com",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 69,
    questionId: QUESTION_UUIDS[68],
    answerBiasLevel: "TOP",
    situation:
      "2023年NPBで佐々木朗希が記録した「奪三振率（K/9）」のリーグ内レンジは？",
    count: "NPB 2023 / metric: K/9",
    choices: [
      { id: "a", text: "上位10％程度" },
      { id: "b", text: "上位30％程度" },
      { id: "c", text: "平均付近" },
      { id: "d", text: "平均以下" },
    ],
    answerChoiceId: "a",
    explanation:
      "実データ：2023年佐々木のK/9はリーグトップクラス（上位10％帯）。NPB公式の投手成績で定義・再取得可能。出典：NPB公式 / season 2023。",
    sourceLabel: "NPB 公式",
    sourceUrl: "https://npb.jp/bis/2023/stats/pit_c.html",
    sourceType: "data",
    difficulty: 3,
    season: 2023,
    metric: "K/9",
    league: "NPB",
    source_url: "https://npb.jp/bis/2023/stats/pit_c.html",
  },
  {
    kind: "definition",
    questionType: "THEORY",
    id: 70,
    questionId: QUESTION_UUIDS[69],
    situation:
      "ランナー2塁の場面で、ピックオフやけん制を意識した配球の傾向は？",
    count: "配球セオリー",
    choices: [
      { id: "a", text: "上位10％程度" },
      { id: "b", text: "上位30％程度" },
      { id: "c", text: "平均付近" },
      { id: "d", text: "平均以下" },
    ],
    answerChoiceId: "c",
    explanation:
      "配球セオリー：2塁ランナーではけん制・ピックオフと打者への配球のバランスが重要で、試行率は球団・状況により平均付近に分布することが多い。",
    sourceLabel: "カウント・走者別配球",
    sourceUrl: "https://ja.wikipedia.org/wiki/ボールカウント",
    sourceType: "static",
    difficulty: 2,
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 71,
    questionId: QUESTION_UUIDS[70],
    answerBiasLevel: "TOP",
    situation:
      "2023年MLBで、1-2カウントから「球速が遅い球種」の空振り率（Whiff%）が最も高かった球種は？",
    count: "MLB 2023 / metric: Whiff% (低速球)",
    choices: [
      { id: "a", text: "4シーム" },
      { id: "b", text: "スライダー" },
      { id: "c", text: "フォーク" },
      { id: "d", text: "カーブ" },
    ],
    answerChoiceId: "c",
    explanation:
      "実データ：1-2での変化球（低速）はWhiff%上位帯。出典：Baseball Savant / season 2023。",
    sourceLabel: "Baseball Savant",
    sourceUrl: "https://baseballsavant.mlb.com",
    sourceType: "data",
    difficulty: 4,
    season: 2023,
    metric: "Whiff% (低速球)",
    league: "MLB",
    source_url: "https://baseballsavant.mlb.com",
  },
  {
    kind: "definition",
    questionType: "THEORY",
    id: 72,
    questionId: QUESTION_UUIDS[71],
    situation:
      "無死満塁の場面で、初球をストライクにできなかった投手層が陥りやすい傾向は？",
    count: "配球セオリー",
    choices: [
      { id: "a", text: "上位10％程度" },
      { id: "b", text: "上位30％程度" },
      { id: "c", text: "平均付近" },
      { id: "d", text: "平均以下" },
    ],
    answerChoiceId: "d",
    explanation:
      "配球セオリー：満塁ではプレッシャーで初球が甘くなったり、慎重になりすぎてストライクが少なくなる層は平均以下に分布しやすい。",
    sourceLabel: "場面別配球",
    sourceUrl: "https://ja.wikipedia.org/wiki/ボールカウント",
    sourceType: "static",
    difficulty: 3,
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 73,
    questionId: QUESTION_UUIDS[72],
    answerBiasLevel: "MID",
    situation:
      "2023年MLBで、先発投手の「球種別Whiff%」がリーグ内で最も高かった球種は？",
    count: "MLB 2023 / metric: Whiff% by pitch",
    choices: [
      { id: "a", text: "4シーム" },
      { id: "b", text: "スライダー" },
      { id: "c", text: "スプリット" },
      { id: "d", text: "カーブ" },
    ],
    answerChoiceId: "b",
    explanation:
      "実データ：2023年MLB先発のスプリット・スライダー系はWhiff%でリーグ上位帯。出典：Baseball Savant / 2023。",
    sourceLabel: "Baseball Savant",
    sourceUrl: "https://baseballsavant.mlb.com/leaderboard/statcast",
    sourceType: "data",
    difficulty: 4,
    season: 2023,
    metric: "Whiff% by pitch",
    league: "MLB",
    source_url: "https://baseballsavant.mlb.com/leaderboard/statcast",
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 74,
    questionId: QUESTION_UUIDS[73],
    answerBiasLevel: "AVG",
    situation:
      "2024年MLBで、2-1カウントの「変化球使用率」がリーグ平均付近だった球団はどのレンジ？",
    count: "MLB 2024 / metric: 変化球使用率（2-1）",
    choices: [
      { id: "a", text: "上位10％程度" },
      { id: "b", text: "上位30％程度" },
      { id: "c", text: "平均付近" },
      { id: "d", text: "平均以下" },
    ],
    answerChoiceId: "c",
    explanation:
      "実データ：2-1での変化球使用率はリーグ平均付近に分布。出典：Baseball Savant / season 2024。",
    sourceLabel: "Baseball Savant",
    sourceUrl: "https://baseballsavant.mlb.com",
    sourceType: "data",
    difficulty: 2,
    season: 2024,
    metric: "変化球使用率（2-1）",
    league: "MLB",
    source_url: "https://baseballsavant.mlb.com",
  },
  {
    kind: "definition",
    questionType: "THEORY",
    id: 75,
    questionId: QUESTION_UUIDS[74],
    situation:
      "1アウト走者1塁でダブルプレーを狙うとき、ゴロを打たせにいく球種の被打率の傾向は？",
    count: "配球セオリー",
    choices: [
      { id: "a", text: "上位10％程度（低い）" },
      { id: "b", text: "上位30％程度" },
      { id: "c", text: "平均付近" },
      { id: "d", text: "平均以下" },
    ],
    answerChoiceId: "a",
    explanation:
      "配球セオリー：ゴロ狙いの沈む球は打たせて取る場面で有効で、うまく決まったときの被打率は低い（上位10％帯）傾向がある。",
    sourceLabel: "場面別配球",
    sourceUrl: "https://ja.wikipedia.org/wiki/ボールカウント",
    sourceType: "static",
    difficulty: 3,
  },
  {
    kind: "stat",
    questionType: "REAL_DATA",
    id: 76,
    questionId: QUESTION_UUIDS[75],
    answerBiasLevel: "LOW",
    situation:
      "2024年MLBで、2-0カウントから「ゾーン外への投球率」が高かった投手層はどのレンジ？",
    count: "MLB 2024 / metric: Zone% (2-0)",
    choices: [
      { id: "a", text: "上位10％程度" },
      { id: "b", text: "上位30％程度" },
      { id: "c", text: "平均付近" },
      { id: "d", text: "平均以下" },
    ],
    answerChoiceId: "d",
    explanation:
      "実データ：2-0でゾーン外に投げる層はリーグ平均以下に分布。出典：Baseball Savant / 2024。",
    sourceLabel: "Baseball Savant",
    sourceUrl: "https://baseballsavant.mlb.com",
    sourceType: "data",
    difficulty: 3,
    season: 2024,
    metric: "Zone% (2-0)",
    league: "MLB",
    source_url: "https://baseballsavant.mlb.com",
  },
  {
    kind: "definition",
    questionType: "THEORY",
    id: 77,
    questionId: QUESTION_UUIDS[76],
    situation:
      "延長戦で決め球として使われる球種の空振りを取る効果の傾向は？",
    count: "配球セオリー",
    choices: [
      { id: "a", text: "上位10％程度" },
      { id: "b", text: "上位30％程度" },
      { id: "c", text: "平均付近" },
      { id: "d", text: "平均以下" },
    ],
    answerChoiceId: "b",
    explanation:
      "配球セオリー：延長では決め球に変化球が多用され、空振りを取る効果は比較的高い（上位30％帯）傾向がある。",
    sourceLabel: "場面別配球",
    sourceUrl: "https://ja.wikipedia.org/wiki/ボールカウント",
    sourceType: "static",
    difficulty: 4,
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
 * --- 追加 REAL_DATA 10問（id 43-52）---
 * 43  REAL_DATA  MLB  2024  打率     TOP   —   Baseball-Reference
 * 44  REAL_DATA  MLB  2023  奪三振   MID   —   Baseball-Reference
 * 45  REAL_DATA  MLB  2024  出塁率   AVG   —   MLB.com
 * 46  REAL_DATA  MLB  2023  BB/9     LOW   —   Baseball-Reference
 * 47  REAL_DATA  MLB  2024  ERA     MID   山本 MLB.com
 * 48  REAL_DATA  MLB  2023  盗塁    AVG   大谷 Baseball-Reference
 * 49  REAL_DATA  NPB  2024  チーム打率 TOP  —   NPB公式
 * 50  REAL_DATA  NPB  2023  チーム本塁打 MID — NPB公式
 * 51  REAL_DATA  NPB  2024  チーム失点 LOW  —   NPB公式
 * 52  REAL_DATA  NPB  2023  BB/9    MID   佐々木 NPB公式
 * 条件確認: MLB 6問 / NPB 4問、スター問題 3問（47,48,52）、スターは MID/AVG のみ（TOP禁止）
 * -------------------------------------------------------------------------
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

/**
 * 実データ配球（PITCHING_REAL）の id 一覧。出題バランス用に利用可能。
 * WEAK→THEORY 変換後: id 11 + 53,54,55,56,59,61,62,63,65,66,68,69,71,73,74,76 = 18問（SAFE 指標のみ）
 */
const PITCHING_REAL_IDS = [11, 53, 54, 55, 56, 59, 61, 62, 63, 65, 66, 68, 69, 71, 73, 74, 76];

/** 実データ問題プール（40問）。REAL_DATA のみ。WEAK→THEORY 変換で 12,57,58,60,64,67,70,72,75,77 を除外。 */
const REAL_DATA_POOL: Question[] = pickByIds(QUESTIONS_POOL, [
  11, 14, 15, 18, 23, 24, 25, 26, 27, 33, 34, 35, 36, 37,
  43, 44, 45, 46, 47, 48, 49, 50, 51, 52,
  53, 54, 55, 56, 59, 61, 62, 63, 65, 66, 68, 69, 71, 73, 74, 76,
]);

/** 配球セオリー問題プール（19問）。THEORY に WEAK から変換した 12,57,58,60,64,67,70,72,75,77 を追加。 */
const THEORY_POOL: Question[] = pickByIds(QUESTIONS_POOL, [
  1, 4, 7, 28, 29, 30, 38, 39, 40,
  12, 57, 58, 60, 64, 67, 70, 72, 75, 77,
]);

/*
 * 出典信頼性精査後の問題数・比率（REAL_DATA / PITCHING_REAL / THEORY / KNOWLEDGE）
 * - REAL_DATA（実データ）: 40問（REAL_DATA_POOL）
 * - PITCHING_REAL（SAFE 指標のみ）: 18問（PITCHING_REAL_IDS）
 * - THEORY（配球セオリー）: 19問（THEORY_POOL）
 * - KNOWLEDGE（知識問題）: 6問（KNOWLEDGE_POOL）
 * 出題比率 5:3:2 は getSessionQuestions で REAL 5 / THEORY 3 / KNOW 2 の重みで維持。
 *
 * THEORY に変更した問題（WEAK→PITCHING_THEORY）: id 12, 57, 58, 60, 64, 67, 70, 72, 75, 77
 * 差し替えた問題（WEAK→SAFE 指標）: id 62（初球ストライク率 MLB）, id 69（佐々木朗希 K/9 NPB）
 * 削除した問題: なし（全件 THEORY 変換または指標差し替え）
 *
 * 選択肢表現統一（STATS_REAL 順位帯 / PITCHING_REAL 球種4択）で変更した問題:
 * - STATS_REAL 順位帯4択（1〜3位 / 4〜10位 / 11〜20位 / 21位以下）: id 36, 43, 44, 45, 46, 49, 50, 51
 * - PITCHING_REAL 球種4択へ差し替え: id 53, 54, 55, 56, 59, 63, 66, 71, 73
 * - 日本人スター（大谷/山本/ダル/佐々木）を含む STATS_REAL・PITCHING_REAL はレンジ維持: id 14, 15, 23, 24, 25, 33, 34, 35, 47, 48, 52, 61, 65, 69
 */

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

const JAPANESE_STAR_MARKERS = ["大谷", "山本", "ダル", "佐々木"] as const;

/**
 * 日本人スター（大谷/山本/ダル/佐々木）を扱う問題かどうか。
 * situation（問題文）または name/players 相当のフィールドにマーカーが含まれるかで判定。
 */
export function isJapaneseStarQuestion(q: Question): boolean {
  const text = q.situation;
  if (!text) return false;
  return JAPANESE_STAR_MARKERS.some((m) => text.includes(m));
}

/** 問題の正解バイアスレベル（未設定の REAL_DATA は AVG 扱いで出題バランス用） */
export function getAnswerBiasLevel(q: Question): AnswerBiasLevel {
  if (q.answerBiasLevel) return q.answerBiasLevel;
  return getQuestionType(q) === "REAL_DATA" ? "AVG" : "AVG";
}

/** 出題バランス用のレベル順（ラウンドロビン用） */
const BIAS_LEVEL_ORDER: AnswerBiasLevel[] = ["TOP", "MID", "AVG", "LOW"];

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
  /** 同日にすでに出題した questionId。これらを除外して抽選する */
  excludeQuestionIds?: string[];
}

/**
 * 候補不足時に重複を許可するか。
 * true: 除外後プールが足りなければ元のプールから抽選（同日に同じ問題が出る可能性あり）
 * false: 除外後のプールのみで抽選（5問に満たない場合あり。呼び出し側でメッセージ表示推奨）
 */
const ALLOW_DUPLICATE_WHEN_INSUFFICIENT = true;

/** 配列を Fisher–Yates でシャッフルし、先頭 n 件を返す（同一セッション内重複なし） */
function shuffleDraw<T extends { questionId: string }>(pool: T[], n: number, exclude?: string[]): T[] {
  const filtered = exclude?.length
    ? pool.filter((q) => !exclude.includes(q.questionId))
    : [...pool];
  const source =
    ALLOW_DUPLICATE_WHEN_INSUFFICIENT && filtered.length < n && (exclude?.length ?? 0) > 0
      ? [...pool]
      : filtered;
  const copy = [...source];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

/** REAL_DATA を answerBiasLevel でグループ化（未設定は AVG） */
function groupRealByBiasLevel(
  pool: Question[],
  exclude?: string[]
): Record<AnswerBiasLevel, Question[]> {
  const filtered = exclude?.length
    ? pool.filter((q) => !exclude.includes(q.questionId))
    : [...pool];
  const groups: Record<AnswerBiasLevel, Question[]> = {
    TOP: [],
    MID: [],
    AVG: [],
    LOW: [],
  };
  for (const q of filtered) {
    const level = getAnswerBiasLevel(q);
    groups[level].push(q);
  }
  return groups;
}

/** レベル均等を意識して REAL から n 問選ぶ（ラウンドロビン＋スターTOP最大1問） */
function drawRealWithBalance(pool: Question[], n: number, exclude?: string[]): Question[] {
  const groups = groupRealByBiasLevel(pool, exclude);
  const total =
    groups.TOP.length + groups.MID.length + groups.AVG.length + groups.LOW.length;
  if (total === 0) return [];
  if (n >= total) {
    const all = [...groups.TOP, ...groups.MID, ...groups.AVG, ...groups.LOW];
    const copy = [...all];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, n);
  }
  const selected: Question[] = [];
  const usedIds = new Set<string>();
  const pickOne = (arr: Question[]): Question | null => {
    const avail = arr.filter((q) => !usedIds.has(q.questionId));
    if (avail.length === 0) return null;
    const q = avail[Math.floor(Math.random() * avail.length)];
    usedIds.add(q.questionId);
    return q;
  };
  let round = 0;
  while (selected.length < n) {
    let added = 0;
    for (const level of BIAS_LEVEL_ORDER) {
      if (selected.length >= n) break;
      const cand = pickOne(groups[level]);
      if (!cand) continue;
      const isStarTop =
        isJapaneseStarQuestion(cand) && getAnswerBiasLevel(cand) === "TOP";
      const starTopCount = selected.filter(
        (q) => isJapaneseStarQuestion(q) && getAnswerBiasLevel(q) === "TOP"
      ).length;
      if (isStarTop && starTopCount >= 1) {
        usedIds.delete(cand.questionId);
        const altPool = [...groups.MID, ...groups.AVG, ...groups.LOW].filter(
          (q) => !usedIds.has(q.questionId)
        );
        const alt = altPool.length > 0 ? pickOne(altPool) : null;
        if (alt) {
          selected.push(alt);
          added++;
        } else {
          usedIds.add(cand.questionId);
          selected.push(cand);
          added++;
        }
      } else {
        selected.push(cand);
        added++;
      }
    }
    if (added === 0) break;
    round++;
    if (round > 20) break;
  }
  while (selected.length < n) {
    const rest = pool.filter((q) => !usedIds.has(q.questionId));
    if (rest.length === 0) break;
    const q = rest[Math.floor(Math.random() * rest.length)];
    usedIds.add(q.questionId);
    selected.push(q);
  }
  return selected.slice(0, n);
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
 * - 同日にすでに出題した questionId は excludeQuestionIds で除外
 * - 構成 [REAL, THEORY, KNOW] を重み付きでランダムに選択（REAL>=2, KNOW<=1）
 * - REAL は TOP/MID/AVG/LOW の比率がなるべく均等になるよう抽選（不足レベル優先）
 * - 日本人スター問題の TOP はセッション内で最大1問まで
 * - 最後に並び順をシャッフル
 * @param options.dataOnly true のとき実データ5問のみ
 * @param options.excludeQuestionIds 同日使用済み questionId（除外して抽選）
 */
export function getSessionQuestions(options?: SessionOptions): Question[] {
  const exclude = options?.excludeQuestionIds;

  if (options?.dataOnly === true) {
    const five = drawRealWithBalance(REAL_DATA_POOL, 5, exclude);
    if (process.env.NODE_ENV === "development") {
      logSessionBiasLevels(five);
    }
    return five;
  }
  const { r, t, k } = pickComposition();
  const real = drawRealWithBalance(REAL_DATA_POOL, r, exclude);
  const theory = shuffleDraw(THEORY_POOL, t, exclude);
  const know = shuffleDraw(KNOWLEDGE_POOL, k, exclude);
  const five = [...real, ...theory, ...know];
  const copy = [...five];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  const session = copy.slice(0, 5);
  if (process.env.NODE_ENV === "development") {
    logSessionBiasLevels(session);
  }
  return session;
}

/**
 * 開発者向け: セッション内の REAL_DATA の TOP/MID/AVG/LOW 比率をログし、偏りが強い場合は warn。
 */
export function logSessionBiasLevels(session: Question[]): void {
  const real = session.filter((q) => getQuestionType(q) === "REAL_DATA");
  if (real.length === 0) return;
  const counts: Record<AnswerBiasLevel, number> = {
    TOP: 0,
    MID: 0,
    AVG: 0,
    LOW: 0,
  };
  for (const q of real) {
    counts[getAnswerBiasLevel(q)]++;
  }
  const total = real.length;
  const ratio = `TOP:${counts.TOP} MID:${counts.MID} AVG:${counts.AVG} LOW:${counts.LOW}`;
  /* eslint-disable no-console */
  console.log(`[logSessionBiasLevels] REAL_DATA ${total}問 バイアスレベル比率: ${ratio}`);
  const maxCount = Math.max(counts.TOP, counts.MID, counts.AVG, counts.LOW);
  if (maxCount >= total - 1 && total >= 2) {
    console.warn(
      "[logSessionBiasLevels] バイアスレベルが偏っています。TOP/MID/AVG/LOW の均等化を推奨:",
      ratio
    );
  }
  /* eslint-enable no-console */
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

  const biasTop: number[] = [];
  const biasMid: number[] = [];
  const biasAvg: number[] = [];
  const biasLow: number[] = [];

  for (let i = 0; i < runs; i++) {
    const session = getSessionQuestions();
    let r = 0,
      t = 0,
      k = 0;
    let top = 0,
      mid = 0,
      avg = 0,
      low = 0;
    for (const q of session) {
      const type = getQuestionType(q);
      if (type === "REAL_DATA") {
        r++;
        const level = getAnswerBiasLevel(q);
        if (level === "TOP") top++;
        else if (level === "MID") mid++;
        else if (level === "AVG") avg++;
        else low++;
      } else if (type === "THEORY") t++;
      else k++;
    }
    realCounts.push(r);
    theoryCounts.push(t);
    knowCounts.push(k);
    biasTop.push(top);
    biasMid.push(mid);
    biasAvg.push(avg);
    biasLow.push(low);
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
  console.log(
    "REAL_DATA バイアスレベル（平均/セッション）: TOP",
    avg(biasTop).toFixed(2),
    "MID",
    avg(biasMid).toFixed(2),
    "AVG",
    avg(biasAvg).toFixed(2),
    "LOW",
    avg(biasLow).toFixed(2)
  );
  console.log("制約違反: REAL<2 →", violationsReal, "件, KNOW>1 →", violationsKnow, "件");
  warnRealDataAnswerBias();
  /* eslint-enable no-console */
}

/**
 * 開発者向け: 日本人スター問題で answerBiasLevel が TOP のときに warn。
 * questionId と questionText（situation）を出す。
 */
export function warnJapaneseStarTopBias(): void {
  if (typeof process !== "undefined" && process.env?.NODE_ENV !== "development") return;
  for (const q of QUESTIONS_POOL) {
    if (!isJapaneseStarQuestion(q)) continue;
    if (q.answerBiasLevel !== "TOP") continue;
    /* eslint-disable-next-line no-console */
    console.warn(
      "[warnJapaneseStarTopBias] 日本人スター問題で answerBiasLevel が TOP です。MID/AVG とレンジ型選択肢の検討を推奨:",
      { questionId: q.questionId, questionText: q.situation }
    );
  }
}

/**
 * 開発者向け: REAL_DATA 問題で正解が「常に1番目」や「上位表現」に偏っていないか検知する。
 * 問題追加時や scripts/debug.ts から呼ぶ想定。本番では呼ばなくてよい。
 */
export function warnRealDataAnswerBias(): void {
  warnJapaneseStarTopBias();
  const realQuestions = QUESTIONS_POOL.filter((q) => getQuestionType(q) === "REAL_DATA");
  const topBias: { id: number; text: string }[] = [];
  const upperBias: { id: number; text: string }[] = [];

  for (const q of realQuestions) {
    const correctChoice = q.choices.find((c) => c.id === q.answerChoiceId);
    if (!correctChoice) continue;
    const isFirst = q.choices[0]?.id === q.answerChoiceId;
    if (isFirst) topBias.push({ id: q.id, text: correctChoice.text });
    if (/1位|上位\d*位以内|^1位/.test(correctChoice.text)) {
      upperBias.push({ id: q.id, text: correctChoice.text });
    }
  }

  if (topBias.length > 0 || upperBias.length > 0) {
    /* eslint-disable no-console */
    if (topBias.length > 0) {
      console.warn(
        "[warnRealDataAnswerBias] 正解が choices の1番目になっている REAL_DATA があります（表示順はシャッフルされるので表示上は散らばります）:",
        topBias
      );
    }
    if (upperBias.length > 0) {
      console.warn(
        "[warnRealDataAnswerBias] 正解が「1位」「上位○位以内」等の表現の REAL_DATA が多くあります。順位・指標を散らすと偏り対策になります:",
        upperBias
      );
    }
    /* eslint-enable no-console */
  }
}
