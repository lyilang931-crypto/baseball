import type { Metadata } from "next";

type Props = {
  searchParams: Promise<{ score?: string; total?: string; rating?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const score = params.score ?? "0";
  const total = params.total ?? "5";
  const rating = params.rating ?? "";
  const q = new URLSearchParams({ score, total });
  if (rating) q.set("rating", rating);

  return {
    title: "今日の1球 - 結果シェア",
    description: `結果: ${score}/${total} 正解。あなたなら、どうする？`,
    openGraph: {
      title: "今日の1球 - 結果シェア",
      description: `結果: ${score}/${total} 正解`,
      images: [{ url: `/share/og?${q.toString()}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "今日の1球 - 結果シェア",
      description: `結果: ${score}/${total} 正解`,
      images: [`/share/og?${q.toString()}`],
    },
  };
}

export default async function SharePage({ searchParams }: Props) {
  const params = await searchParams;
  const score = params.score ?? "0";
  const total = params.total ?? "5";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        ⚾ 今日の1球
      </h1>
      <p className="text-gray-600 mb-4">
        結果: {score} / {total} 正解
      </p>
      <p className="text-gray-500 text-sm mb-8">
        このページのURLをシェアすると、OGP画像付きで表示されます。
      </p>
      <a
        href="/"
        className="py-3 px-6 rounded-2xl bg-blue-500 text-white font-bold hover:bg-blue-600"
      >
        トップへ戻る
      </a>
    </div>
  );
}
