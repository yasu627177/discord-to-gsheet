/**
 * URL抽出ユーティリティ
 * DiscordメッセージからYouTubeとZoomのURLを抽出
 */

export interface ExtractedUrl {
  url: string;
  type: 'youtube' | 'zoom';
  title?: string;
}

export interface ExtractedDate {
  month: number;
  day: number;
  year: number;
  dayOfWeek: string; // '日', '月', '火', '水', '木', '金', '土'
}

/**
 * メッセージからURLを抽出
 */
export function extractUrls(message: string): ExtractedUrl[] {
  const urls: ExtractedUrl[] = [];

  // YouTube URL パターン
  const youtubePatterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/g,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]+)/g,
  ];

  // Zoom URL パターン
  const zoomPattern = /(?:https?:\/\/)?(?:[\w-]+\.)?zoom\.us\/[^\s]+/g;

  // YouTube URLを抽出
  for (const pattern of youtubePatterns) {
    const matches = message.matchAll(pattern);
    for (const match of matches) {
      urls.push({
        url: match[0],
        type: 'youtube',
      });
    }
  }

  // Zoom URLを抽出
  const zoomMatches = message.matchAll(zoomPattern);
  for (const match of zoomMatches) {
    urls.push({
      url: match[0],
      type: 'zoom',
    });
  }

  return urls;
}

/**
 * メッセージからタイトルを推測
 * 簡易実装: URLの前の行または同じ行の最初の部分を取得
 */
export function extractTitle(message: string, url: string): string {
  const lines = message.split('\n');

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(url)) {
      // 同じ行でURLの前にテキストがあるか確認
      const beforeUrl = lines[i].substring(0, lines[i].indexOf(url)).trim();
      if (beforeUrl) {
        return beforeUrl;
      }

      // 前の行をタイトルとして使用
      if (i > 0) {
        return lines[i - 1].trim();
      }
    }
  }

  // タイトルが見つからない場合はメッセージの最初の行
  return lines[0].trim() || 'タイトルなし';
}

/**
 * URLの種類を判定
 */
export function detectUrlType(url: string): 'youtube' | 'zoom' | 'unknown' {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  if (url.includes('zoom.us')) {
    return 'zoom';
  }
  return 'unknown';
}

/**
 * メッセージから日付を抽出 (例: "8月4日")
 */
export function extractDate(message: string): ExtractedDate | null {
  // 日本語形式: "8月4日", "12月25日" など
  const japanesePattern = /(\d{1,2})月(\d{1,2})日/;
  const match = message.match(japanesePattern);

  if (match) {
    const month = parseInt(match[1], 10);
    const day = parseInt(match[2], 10);

    // 現在の年を取得
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // 月が現在より後なら前年と判断
    const year = month > currentMonth ? currentYear - 1 : currentYear;

    // 曜日を計算
    const date = new Date(year, month - 1, day);
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];

    return {
      month,
      day,
      year,
      dayOfWeek,
    };
  }

  return null;
}

/**
 * タイトルとURLからキーワードを抽出
 */
export function extractKeywords(title: string, url: string): string {
  // タイトルから重要な単語を抽出
  const keywords: string[] = [];

  // タイトルを単語に分割（スペースや記号で区切る）
  const words = title.split(/[\s、。！？❌×＆]/);

  for (const word of words) {
    const trimmed = word.trim();
    if (trimmed.length >= 2) { // 2文字以上の単語のみ
      keywords.push(trimmed);
    }
  }

  return keywords.slice(0, 10).join(', '); // 最大10個のキーワード
}
