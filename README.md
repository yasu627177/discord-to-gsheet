# discord-to-gsheet

DiscordのZoom/YouTube URLを自動的にGoogleスプレッドシートに保存し、ジャンル別に分類するBotです。

## 機能

- DiscordメッセージからYouTube/Zoom URLを自動検出
- タイトルとURLをGoogleスプレッドシートに保存
- ジャンル別に自動分類（技術、ビジネス、デザイン、教育、エンタメなど）
- 投稿日時、投稿者、チャンネルIDも記録
- 設定ファイルでジャンルとチャンネルをカスタマイズ可能

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Discord Botの作成

1. [Discord Developer Portal](https://discord.com/developers/applications)にアクセス
2. 「New Application」をクリックして新しいアプリケーションを作成
3. 「Bot」タブに移動し、「Add Bot」をクリック
4. Bot Tokenをコピー（後で使用）
5. 「Privileged Gateway Intents」で以下を有効化:
   - MESSAGE CONTENT INTENT
   - SERVER MEMBERS INTENT
6. OAuth2 > URL Generatorで以下を選択:
   - Scopes: `bot`
   - Bot Permissions: `Read Messages/View Channels`, `Read Message History`
7. 生成されたURLでBotをサーバーに招待

### 3. Google Sheets APIの設定

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成
3. 「APIとサービス」>「ライブラリ」でGoogle Sheets APIを有効化
4. 「認証情報」>「認証情報を作成」>「サービスアカウント」を作成
5. サービスアカウントのキー（JSON）をダウンロード
6. サンプルファイルをコピーして編集:
   ```bash
   cp credentials.json.example credentials.json
   ```
   ダウンロードしたJSONの内容を`credentials.json`に貼り付け
7. Googleスプレッドシートを作成し、サービスアカウントのメールアドレスと共有（編集権限）
8. スプレッドシートのIDをURLからコピー
   - URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

### 4. 環境変数の設定

```bash
cp .env.example .env
```

`.env`ファイルを編集して以下を設定:

```env
DISCORD_BOT_TOKEN=your_discord_bot_token_here
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_CREDENTIALS_PATH=./credentials.json
```

### 5. 設定ファイルのカスタマイズ

`config.json`を編集して、監視対象チャンネルとジャンルを設定:

```json
{
  "discord": {
    "targetChannelIds": [
      "YOUR_CHANNEL_ID_1",
      "YOUR_CHANNEL_ID_2"
    ]
  },
  "genres": {
    "技術": ["プログラミング", "React", "AI"],
    "ビジネス": ["マーケティング", "セールス"],
    "デザイン": ["UI", "UX", "Figma"]
  }
}
```

チャンネルIDの取得方法:
1. Discord設定で「開発者モード」を有効化
2. チャンネルを右クリック >「IDをコピー」

## 使い方

### Botの起動

```bash
npm run dev
```

### 動作確認

監視対象のDiscordチャンネルにYouTubeまたはZoomのURLを投稿してください:

```
プログラミング入門講座
https://www.youtube.com/watch?v=xxxxx
```

Botが自動的にURLを検出し、Googleスプレッドシートに保存します。

### ビルドと本番環境

```bash
npm run build        # TypeScriptをビルド
npm run typecheck    # 型チェック
npm run lint         # コードリント
```

## Project Structure

```
discord-to-gsheet/
├── src/              # Source code
│   └── index.ts     # Entry point
├── tests/           # Test files
│   └── example.test.ts
├── .claude/         # AI agent configuration
│   ├── agents/      # Agent definitions
│   └── commands/    # Custom commands
├── .github/
│   ├── workflows/   # CI/CD automation
│   └── labels.yml   # Label system (53 labels)
├── CLAUDE.md        # AI context file
└── package.json
```

## Miyabi Framework

This project uses **7 autonomous AI agents**:

1. **CoordinatorAgent** - Task planning & orchestration
2. **IssueAgent** - Automatic issue analysis & labeling
3. **CodeGenAgent** - AI-powered code generation
4. **ReviewAgent** - Code quality validation (80+ score)
5. **PRAgent** - Automatic PR creation
6. **DeploymentAgent** - CI/CD deployment automation
7. **TestAgent** - Test execution & coverage

### Workflow

1. **Create Issue**: Describe what you want to build
2. **Agents Work**: AI agents analyze, implement, test
3. **Review PR**: Check generated pull request
4. **Merge**: Automatic deployment

### Label System

Issues transition through states automatically:

- `📥 state:pending` - Waiting for agent assignment
- `🔍 state:analyzing` - Being analyzed
- `🏗️ state:implementing` - Code being written
- `👀 state:reviewing` - Under review
- `✅ state:done` - Completed & merged

## Commands

```bash
# Check project status
npx miyabi status

# Watch for changes (real-time)
npx miyabi status --watch

# Create new issue
gh issue create --title "Add feature" --body "Description"
```

## Configuration

### Environment Variables

Required variables (see `.env.example`):

- `GITHUB_TOKEN` - GitHub personal access token
- `ANTHROPIC_API_KEY` - Claude API key (optional for local development)
- `REPOSITORY` - Format: `owner/repo`

### GitHub Actions

Workflows are pre-configured in `.github/workflows/`:

- CI/CD pipeline
- Automated testing
- Deployment automation
- Agent execution triggers

**Note**: Set repository secrets at:
`https://github.com/yasu627177/discord-to-gsheet/settings/secrets/actions`

Required secrets:
- `GITHUB_TOKEN` (auto-provided by GitHub Actions)
- `ANTHROPIC_API_KEY` (add manually for agent execution)

## Documentation

- **Miyabi Framework**: https://github.com/ShunsukeHayashi/Miyabi
- **NPM Package**: https://www.npmjs.com/package/miyabi
- **Label System**: See `.github/labels.yml`
- **Agent Operations**: See `CLAUDE.md`

## Support

- **Issues**: https://github.com/ShunsukeHayashi/Miyabi/issues
- **Discord**: [Coming soon]

## License

MIT

---

✨ Generated by [Miyabi](https://github.com/ShunsukeHayashi/Miyabi)
