#!/bin/bash
# API エンドポイントテストスクリプト
#
# 使い方:
# 1. 開発サーバーを起動: npm run dev
# 2. 別ターミナルで実行: bash scripts/test-api.sh
#
# Windows (Git Bash/WSL):
# bash scripts/test-api.sh

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "=== API テスト開始 ==="
echo "Base URL: $BASE_URL"
echo ""

# ヘルスチェック
echo "1. ヘルスチェック (GET /api/health)"
curl -s "$BASE_URL/api/health" | head -c 500
echo ""
echo ""

# モニタリング（ログ取得）
echo "2. モニタリング (GET /api/monitoring)"
curl -s "$BASE_URL/api/monitoring?limit=5" | head -c 500
echo ""
echo ""

# モニタリング（統計付き）
echo "3. モニタリング + メトリクス (GET /api/monitoring?metrics=true)"
curl -s "$BASE_URL/api/monitoring?limit=3&metrics=true" | head -c 500
echo ""
echo ""

# 統計取得（存在しないquestionId）
echo "4. 問題統計取得 (GET /api/stats/question)"
curl -s "$BASE_URL/api/stats/question?questionId=00000000-0000-0000-0000-000000000001" | head -c 300
echo ""
echo ""

# エラーレポート
echo "5. エラーレポート (POST /api/errors)"
curl -s -X POST "$BASE_URL/api/errors" \
  -H "Content-Type: application/json" \
  -d '{"message":"Test error from API test","type":"custom","timestamp":'$(date +%s000)'}' | head -c 300
echo ""
echo ""

# 不正なリクエスト（バリデーションテスト）
echo "6. 不正なリクエスト (POST /api/answers - missing fields)"
curl -s -X POST "$BASE_URL/api/answers" \
  -H "Content-Type: application/json" \
  -d '{"userId":"test"}' | head -c 300
echo ""
echo ""

# クライアントエラー一覧
echo "7. クライアントエラー取得 (GET /api/errors)"
curl -s "$BASE_URL/api/errors" | head -c 500
echo ""
echo ""

echo "=== API テスト完了 ==="
