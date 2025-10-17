/**
 * 設定ファイル読み込みユーティリティ
 */

import fs from 'fs/promises';
import path from 'path';

export interface AppConfig {
  discord: {
    targetChannelIds: string[];
    description?: string;
  };
  genres: {
    [genre: string]: string[];
  };
  defaultGenre: string;
}

let cachedConfig: AppConfig | null = null;

/**
 * 設定ファイルを読み込む
 */
export async function loadConfig(configPath?: string): Promise<AppConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  const filePath = configPath || path.join(process.cwd(), 'config.json');

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    cachedConfig = JSON.parse(data);

    if (!cachedConfig) {
      throw new Error('Config is null');
    }

    return cachedConfig;
  } catch (error) {
    console.error(`Failed to load config from ${filePath}:`, error);
    throw new Error('Config file not found or invalid');
  }
}

/**
 * 監視対象チャンネルかどうかを確認
 */
export function isTargetChannel(
  channelId: string,
  config: AppConfig
): boolean {
  return config.discord.targetChannelIds.includes(channelId);
}

/**
 * 設定ファイルをリロード
 */
export function reloadConfig(): void {
  cachedConfig = null;
}

/**
 * 現在の設定を取得（キャッシュ済み）
 */
export function getConfig(): AppConfig | null {
  return cachedConfig;
}
