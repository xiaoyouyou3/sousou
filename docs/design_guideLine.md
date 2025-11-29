# UI/UX デザインガイドライン (Frontend Design Specification)

## 1. デザインコンセプト (Design Philosophy)

**キーワード:** Immersive (没入感), Minimalist (ミニマリズム), Sophisticated (洗練)

**コアバリュー:**

- **Content First:** 音楽と感情エフェクトを主役にするため、UIパーツは極力シンプルで邪魔にならないデザインとする。
- **Emotional Depth:** 「ダークブルー」を基調とした深みのある色使いで、ユーザーの内面世界（心の中）を表現する。
- **Fluid Interaction:** TikTokやInstagramのような、直感的で滑らかなスワイプ操作とマイクロインタラクションを重視する。

## 2. カラーパレット (Color System)

本アプリの独自性である「感情」を際立たせるため、ベースカラーは落ち着いたトーンにし、感情カラーをアクセントとして使用する。

### 2.1 テーマカラー (Base Themes)

ユーザー設定により切り替え可能な2つのテーマを定義する。特にダークモードをアプリの推奨（デフォルト的な立ち位置）とし、世界観を構築する。

| 項目 | Light Theme (Day Mode) | Dark Theme (Night Mode) | 備考 |
| :--- | :--- | :--- | :--- |
| Primary Background | #FFFFFF (White) | #0F172A (Deep Dark Blue) | ダークモードは純粋な黒ではなく、深い青を使用し、リラックス感と高級感を演出。 |
| Secondary Background | #F8F9FA (Off White) | #1E293B (Slate Blue) | カードやモーダル、タブバーの背景色。 |
| Primary Text | #111827 (Gray 900) | #F1F5F9 (Slate 100) | 最も重要なテキスト。 |
| Secondary Text | #6B7280 (Gray 500) | #94A3B8 (Slate 400) | 補足情報やメタデータ。 |
| Border / Divider | #E5E7EB (Gray 200) | #334155 (Slate 700) | 区切り線。極力薄くし、空間で区切ることを推奨。 |
| Accent Color | #3B82F6 (Blue 500) | #60A5FA (Blue 400) | 主要アクションボタン（保存、決定など）。 |

### 2.2 エモーションカラー (Emotion Accents)

楽曲再生時のエフェクトや、感情タグに使用するカラー。ネオンのような発光表現（Glow Effect）を用いることで、ダークブルー背景に映えるデザインとする。

- **喜び (Joy):** `#FACC15` (Vivid Yellow)
- **怒り (Anger):** `#EF4444` (Vivid Red)
- **悲しみ (Sadness):** `#3B82F6` (Royal Blue)
- **驚き (Surprise):** `#A855F7` (Electric Purple)
- **恐れ (Fear):** `#14B8A6` (Teal / Cyan)
- **嫌悪 (Disgust):** `#22C55E` (Acid Green)
- **愛情 (Love):** `#EC4899` (Hot Pink)

## 3. タイポグラフィ (Typography)

可読性が高く、モダンな印象を与えるサンセリフ体を使用する。

### 3.1 フォントファミリー

- **日本語:** Noto Sans JP (Weight: 400, 500, 700)
- **英語/数字:** Inter または SF Pro Display (iOS), Roboto (Android)

### 3.2 テキストスタイル定義

| スタイル名 | サイズ (px) | Weight | Line Height | 用途 |
| :--- | :--- | :--- | :--- | :--- |
| Display Large | 32px | Bold (700) | 1.2 | LPなどの強調見出し |
| Heading 1 | 24px | Bold (700) | 1.3 | 画面タイトル |
| Heading 2 | 20px | SemiBold (600) | 1.4 | セクション見出し |
| Body Large | 16px | Regular (400) | 1.5 | 本文、フィード内の主要テキスト |
| Body Medium | 14px | Regular (400) | 1.5 | 補足説明、リスト項目 |
| Caption | 12px | Medium (500) | 1.4 | タイムスタンプ、ラベル |

## 4. UIコンポーネント (Component Design)

InstagramやTikTokのUIトレンドを取り入れ、操作性を最優先する。

### 4.1 形状と質感

- **角丸 (Border Radius):**
    - カード/ボタン: 12px ～ 16px (親しみやすさとモダンさ)
    - モーダル上部: 24px
- **Glassmorphism (すりガラス表現):**
    - タブバーやフローティングボタンの背景に、不透明度を下げた背景色 + Blur エフェクト（ぼかし）を適用し、没入感を高める。
    - 例 (Dark Theme): `background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px);`

### 4.2 ナビゲーションバー (Bottom Navigation)

- **スタイル:** アイコンのみのミニマルなデザイン。
- **配置:**
    - Home (フィード)
    - Create (＋ボタン、中央強調)
    - Profile (ユーザー)
- **アクティブ状態:** アイコンが塗りつぶし（Solid）になり、メインカラーまたは白で強調。

### 4.3 ボタン (Buttons)

- **Primary Button:**
    - 背景: Accent Color (グラデーションも可)
    - テキスト: 白
    - 形状: 塗りつぶしの角丸長方形 (Pill shape)
- **Ghost Button / Icon Button:**
    - 背景: 透明
    - アイコン: 白 (Dark Theme時)
    - 用途: プレイヤー操作（再生/一時停止、いいね）など、映像の上に重ねるボタン。

## 5. レイアウトとインタラクション (Layout & Interaction)

### 5.1 ホームフィード (Immersive Feed)

- 全画面表示: ヘッダーやフッターの領域を最小限にし、楽曲のエフェクト映像を画面いっぱいに表示する。
- オーバーレイUI: 曲名、作者、アクションボタン（いいね等）は、映像の下層に白文字（ドロップシャドウ付き）で重ねて表示する。
- スナップスクロール: 1画面1コンテンツとし、縦スワイプで吸い付くように次の曲へ遷移させる。

### 5.2 楽曲作成画面 (Creation Flow)

- ステップUI: 「感情選択」→「ジャンル選択」→「プロンプト入力」を1画面に詰め込まず、スムーズなステップ入力、またはハーフモーダルで手軽に操作できるようにする。
- 感情ホイール: 円形に配置された感情カラーをスワイプで回して選択するような、遊び心のあるインタラクションを検討する。

### 5.3 ダークモード切り替えの挙動

- シームレスな移行: 設定変更時、フェードアニメーション（0.3s程度）を伴って色が切り替わるようにし、目の負担を軽減する。