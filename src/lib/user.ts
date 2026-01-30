const STORAGE_KEY = "baseball_user_id";

/**
 * 匿名ユーザー用の一意IDを返す。
 * ブラウザ: localStorage に無ければ crypto.randomUUID() で生成して保存。
 * SSR: null を返す。
 */
export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
