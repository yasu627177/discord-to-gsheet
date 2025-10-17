/**
 * Google Sheetsクライアント
 * スプレッドシートへのデータ書き込みを管理
 */

import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

export interface VideoEntry {
  title: string;
  url: string;
  type: 'youtube' | 'zoom';
  genre?: string;
  timestamp: Date;
  author?: string;
  channelId?: string;
  eventDate?: string; // "8月4日" など
  dayOfWeek?: string; // "月", "火", "水" など
  keywords?: string; // 検索用キーワード
}

export class SheetsClient {
  private auth: JWT | null = null;
  private spreadsheetId: string;

  constructor(spreadsheetId: string) {
    this.spreadsheetId = spreadsheetId;
  }

  /**
   * Google Sheets APIの認証を初期化
   */
  async initialize(credentials: any): Promise<void> {
    this.auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    await this.auth.authorize();
  }

  /**
   * 動画エントリーをスプレッドシートに追加
   */
  async addVideoEntry(entry: VideoEntry): Promise<void> {
    if (!this.auth) {
      throw new Error('SheetsClient is not initialized');
    }

    const sheets = google.sheets({ version: 'v4', auth: this.auth });

    // ジャンルに応じたシート名を決定
    const sheetName = entry.genre || 'その他';

    // シートが存在するか確認し、なければ作成
    await this.ensureSheetExists(sheets, sheetName);

    // データを追加
    const row = [
      entry.eventDate || '', // イベント日付
      entry.dayOfWeek || '', // 曜日
      entry.timestamp.toISOString(), // 投稿日時
      entry.title, // タイトル
      entry.url, // URL
      entry.type, // タイプ
      entry.keywords || '', // キーワード
      entry.author || '', // 投稿者
      entry.channelId || '', // チャンネルID
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A:I`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });

    console.log(`✅ Added entry to sheet "${sheetName}": ${entry.title}`);
  }

  /**
   * シートが存在することを確認、なければ作成
   */
  private async ensureSheetExists(
    sheets: any,
    sheetName: string
  ): Promise<void> {
    try {
      const response = await sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      const existingSheets = response.data.sheets || [];
      const sheetExists = existingSheets.some(
        (sheet: any) => sheet.properties.title === sheetName
      );

      if (!sheetExists) {
        // シートを作成
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: sheetName,
                  },
                },
              },
            ],
          },
        });

        // ヘッダー行を追加
        await sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `${sheetName}!A1:I1`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [
              ['イベント日付', '曜日', '投稿日時', 'タイトル', 'URL', 'タイプ', 'キーワード', '投稿者', 'チャンネルID'],
            ],
          },
        });

        console.log(`📝 Created new sheet: "${sheetName}"`);
      }
    } catch (error) {
      console.error('Error ensuring sheet exists:', error);
      throw error;
    }
  }

  /**
   * すべてのエントリーを取得（オプション）
   */
  async getAllEntries(sheetName: string = 'その他'): Promise<VideoEntry[]> {
    if (!this.auth) {
      throw new Error('SheetsClient is not initialized');
    }

    const sheets = google.sheets({ version: 'v4', auth: this.auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A2:F`, // ヘッダーをスキップ
    });

    const rows = response.data.values || [];

    return rows.map((row) => ({
      timestamp: new Date(row[0]),
      title: row[1],
      url: row[2],
      type: row[3] as 'youtube' | 'zoom',
      author: row[4],
      channelId: row[5],
      genre: sheetName,
    }));
  }
}
