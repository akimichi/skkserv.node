skkserv.node
============

Node.jsで実装されたSKKサーバー。
辞書データはサーバー起動時にメモリに読み込まれる。
通常のかな漢字変換に加え、Lisp式の評価や四則演算にも対応している。

## 機能

- **かな漢字変換** — SKK辞書（EUC-JP形式）を用いた通常の変換
- **Lisp式の評価** — `(` で始まる読みをLisp式として評価（例: `(+ 1 2)` → `3`）
- **四則演算** — `=` で始まる読みを中置記法の算術式として評価（例: `=2+3` → `5`）

四則演算では `*` `/` が `+` `-` より優先され、括弧 `()` で優先順位を変更できる。

## 必要環境

- Node.js v20
- nvm（推奨）

## セットアップ

```bash
nvm use
npm install
```

## サーバーの起動

```bash
# 開発サーバー（ポート1179）
npm run start

# 本番サーバー（ポート1178）
npm run build
npm run start-prod
```

## クライアント側の設定

SKKクライアント（AquaSKK, ibus-skk, fcitx-skk, DDSKK 等）のサーバー設定で、本サーバーのホストとポートを指定する。

### AquaSKK の場合

`~/Library/Application Support/AquaSKK/skkserv.conf` に以下を追加:

```
127.0.0.1:1178
```

### DDSKK (Emacs) の場合

```elisp
(setq skk-server-host "127.0.0.1")
(setq skk-server-portnum 1178)
```

### fcitx-skk の場合

設定画面の「辞書」でサーバー辞書を追加し、ホストに `127.0.0.1`、ポートに `1178` を指定する。

## 動作確認

`nc` コマンドで直接リクエストを送信できる。

```bash
# かな漢字変換
echo "1あい" | nc localhost 1179
# → 1/愛/藍/相/

# Lisp式の評価（SKKプロトコルでは空白の代わりに _ を使う）
echo "1(+_1_2)" | nc localhost 1179
# → 1/3/

# 四則演算
echo "1=2+3" | nc localhost 1179
# → 1/5/

# バージョン問い合わせ
echo "2 " | nc localhost 1179
# → 0.0.1
```

## SKKプロトコル

リクエストの先頭1文字がコマンドを示す。

| コマンド | 意味 | 例 |
|----------|------|-----|
| `0` | 切断 | `0` |
| `1` + 読み | 変換要求 | `1あい` |
| `2` | バージョン問い合わせ | `2 ` |

変換要求の読みは先頭文字により処理が分岐する:

| 先頭文字 | 処理 | 例 |
|----------|------|-----|
| `(` | Lisp式として評価 | `(+_1_2)` → `3` |
| `=` | 四則演算式として評価 | `=2*3+4` → `10` |
| その他 | 辞書から候補を検索 | `あい` → `愛/藍/相` |

## テスト

```bash

# 全テスト実行

npm test

# 特定のテストファイルを実行

NODE_ENV=test npx mocha --require ts-node/register test/lisp/interpreter.spec.ts
NODE_ENV=test npx mocha --require ts-node/register test/arith/interpreter.spec.ts
```

## ライセンス

MIT
