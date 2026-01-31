const STORAGE_KEY = "baseball_user_id";

/**
 * 匿名ユーザー用の一意IDを返す。
 * ブラウザ: localStorage に無ければ crypto.randomUUID() で生成して保存。
 * 非対応環境（SSR等）: 空文字を返す（呼び出し元はクライアントのみで使用すること）。
 */
export function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `anon-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}
