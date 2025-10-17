/**
 * ジャンル分類ロジック
 * タイトルやURLからジャンルを自動推定
 * config.jsonから設定を読み込んで使用
 */

import type { AppConfig } from '../config/configLoader.js';

export interface GenreKeywords {
  [genre: string]: string[];
}

/**
 * 設定ファイルからジャンルキーワードを初期化
 */
export function initializeGenreKeywords(config: AppConfig): GenreKeywords {
  return config.genres;
}

/**
 * タイトルとURLからジャンルを推定
 */
export function classifyGenre(
  title: string,
  url: string,
  genreKeywords: GenreKeywords,
  defaultGenre: string = 'その他'
): string {
  const text = `${title} ${url}`.toLowerCase();

  // 各ジャンルのキーワードとマッチング
  for (const [genre, keywords] of Object.entries(genreKeywords)) {
    if (genre === defaultGenre) continue;

    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        return genre;
      }
    }
  }

  // どのジャンルにもマッチしない場合
  return defaultGenre;
}
