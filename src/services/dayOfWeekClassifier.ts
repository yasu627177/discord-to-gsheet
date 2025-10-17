/**
 * 曜日ベースのジャンル分類
 */

/**
 * 曜日に基づいてジャンルを決定
 * - 日曜・月曜・火曜: "ユニコ バイブコーディング生配信"
 * - 水曜: "業務効率化"
 * - 木曜: "バイブコーディング共同作業会"
 * - それ以外: "その他"
 */
export function classifyByDayOfWeek(dayOfWeek: string): string {
  switch (dayOfWeek) {
    case '日':
    case '月':
    case '火':
      return 'ユニコ バイブコーディング生配信';
    case '水':
      return '業務効率化';
    case '木':
      return 'バイブコーディング共同作業会';
    default:
      return 'その他';
  }
}
