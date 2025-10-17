/**
 * discord-to-gsheet - Entry Point
 * DiscordのURLをGoogle Sheetsに自動保存
 */

import 'dotenv/config';
import { DiscordBot } from './bot/discordBot.js';
import { SheetsClient } from './services/sheetsClient.js';
import fs from 'fs/promises';

async function main(): Promise<void> {
  console.log('🌸 Discord to Google Sheets Bot');
  console.log('================================');
  console.log('');

  // 環境変数チェック
  const discordToken = process.env.DISCORD_BOT_TOKEN;
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH || './credentials.json';

  if (!discordToken) {
    console.error('❌ DISCORD_BOT_TOKEN is not set in .env file');
    process.exit(1);
  }

  if (!spreadsheetId) {
    console.error('❌ GOOGLE_SPREADSHEET_ID is not set in .env file');
    process.exit(1);
  }

  // Google Sheets認証情報を読み込み
  let credentials;
  try {
    const credentialsData = await fs.readFile(credentialsPath, 'utf-8');
    credentials = JSON.parse(credentialsData);
  } catch (error) {
    console.error(`❌ Failed to load Google credentials from ${credentialsPath}`);
    console.error('   Please ensure credentials.json exists');
    process.exit(1);
  }

  // Google Sheetsクライアントを初期化
  const sheetsClient = new SheetsClient(spreadsheetId);
  await sheetsClient.initialize(credentials);
  console.log('✅ Google Sheets client initialized');

  // Discord Botを初期化して起動
  const bot = new DiscordBot(sheetsClient);
  await bot.start(discordToken);

  console.log('');
  console.log('🚀 Bot is running!');
  console.log('   Press Ctrl+C to stop');

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('');
    console.log('Shutting down...');
    await bot.stop();
    process.exit(0);
  });
}

// Run main
main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
