/**
 * Discord Bot メインロジック
 * 既存メッセージを取得してURL抽出とGoogleシート保存を実行
 */

import { Client, GatewayIntentBits, Message, TextChannel } from 'discord.js';
import { extractUrls, extractTitle, extractDate, extractKeywords } from '../utils/urlExtractor.js';
import { SheetsClient, VideoEntry } from '../services/sheetsClient.js';
import { classifyByDayOfWeek } from '../services/dayOfWeekClassifier.js';
import { loadConfig, isTargetChannel } from '../config/configLoader.js';

export class DiscordBot {
  private client: Client;
  private sheetsClient: SheetsClient;
  private config: any;

  constructor(sheetsClient: SheetsClient) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.sheetsClient = sheetsClient;
  }

  /**
   * Botを初期化
   */
  async initialize(): Promise<void> {
    // 設定を読み込み
    this.config = await loadConfig();

    // イベントハンドラーを設定
    this.setupEventHandlers();

    console.log('✅ Discord Bot initialized');
  }

  /**
   * イベントハンドラーをセットアップ
   */
  private setupEventHandlers(): void {
    this.client.on('ready', async () => {
      console.log(`🤖 Logged in as ${this.client.user?.tag}`);
      console.log(`📡 Fetching messages from ${this.config.discord.targetChannelIds.length} channels`);

      // 既存メッセージを取得
      await this.fetchExistingMessages();
    });

    this.client.on('error', (error) => {
      console.error('Discord client error:', error);
    });
  }

  /**
   * 既存のメッセージを取得して処理
   */
  private async fetchExistingMessages(): Promise<void> {
    console.log('');
    console.log('🔍 Fetching existing messages...');

    let totalProcessed = 0;
    let totalSaved = 0;

    for (const channelId of this.config.discord.targetChannelIds) {
      try {
        const channel = await this.client.channels.fetch(channelId);

        if (!channel || !(channel instanceof TextChannel)) {
          console.log(`⚠️  Channel ${channelId} not found or not a text channel`);
          continue;
        }

        console.log(`📥 Processing channel: ${channel.name}`);

        let lastMessageId: string | undefined;
        let hasMore = true;
        let channelProcessed = 0;
        let channelSaved = 0;

        while (hasMore) {
          const options: any = { limit: 100 };
          if (lastMessageId) {
            options.before = lastMessageId;
          }

          const messages = await channel.messages.fetch(options);

          if (messages.size === 0) {
            hasMore = false;
            break;
          }

          for (const message of messages.values()) {
            // Botのメッセージは無視
            if (message.author.bot) continue;

            const urls = extractUrls(message.content);
            if (urls.length === 0) continue;

            channelProcessed++;

            // 各URLを処理
            for (const urlData of urls) {
              try {
                const title = extractTitle(message.content, urlData.url);

                // 日付を抽出
                const dateInfo = extractDate(message.content);

                // 曜日に基づいてジャンルを決定
                const genre = dateInfo
                  ? classifyByDayOfWeek(dateInfo.dayOfWeek)
                  : 'その他';

                // キーワードを抽出
                const keywords = extractKeywords(title, urlData.url);

                // イベント日付を文字列形式で保存
                const eventDate = dateInfo
                  ? `${dateInfo.month}月${dateInfo.day}日`
                  : '';

                const entry: VideoEntry = {
                  title,
                  url: urlData.url,
                  type: urlData.type,
                  genre,
                  timestamp: message.createdAt,
                  author: message.author.username,
                  channelId: message.channelId,
                  eventDate,
                  dayOfWeek: dateInfo?.dayOfWeek || '',
                  keywords,
                };

                await this.sheetsClient.addVideoEntry(entry);
                channelSaved++;

                console.log(`   ✓ [${genre}] ${eventDate} (${dateInfo?.dayOfWeek || '?'}) ${title}`);
              } catch (error) {
                console.error(`   ✗ Failed to save: ${urlData.url}`, error);
              }
            }
          }

          lastMessageId = messages.last()?.id;

          // レート制限対策: 少し待機
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log(`   ✅ Channel "${channel.name}": ${channelProcessed} messages with URLs, ${channelSaved} saved`);
        totalProcessed += channelProcessed;
        totalSaved += channelSaved;

      } catch (error) {
        console.error(`❌ Error processing channel ${channelId}:`, error);
      }
    }

    console.log('');
    console.log(`✅ Completed! Total: ${totalProcessed} messages processed, ${totalSaved} URLs saved`);
    console.log('');
  }


  /**
   * Botを起動
   */
  async start(token: string): Promise<void> {
    await this.initialize();
    await this.client.login(token);
  }

  /**
   * Botを停止
   */
  async stop(): Promise<void> {
    await this.client.destroy();
    console.log('🛑 Discord Bot stopped');
  }
}
