# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Node.jsで実装されたSKKサーバー。内部にLisp評価器を含み、SKKプロトコルに加えてLisp式の評価も可能。

## 開発コマンド

```bash
# Node.jsバージョンの切り替え（v8.1.3を使用）
nvm use

# テスト実行
npm test

# 特定のテストファイルを実行
NODE_ENV=test npx mocha test/lisp/interpreter.spec.js

# 開発サーバー起動（ポート1179）
npm run start

# 本番サーバー起動（ポート1178）
npm run start-prod

# 辞書データのシード
npm run seed           # 開発環境
npm run seed-prod      # 本番環境
```

## アーキテクチャ

### サーバー層
- `server.js`: エントリーポイント。TCPサーバーをMongoDBと接続して起動
- `lib/service.js`: SKKプロトコルの処理。コマンド0（切断）、1（変換）、2（バージョン）を実装
- `lib/config.js`: 環境別（test/development/production）の設定管理

### データ層
- `models/entry.js`: MongooseによるEntry（読み・候補）スキーマ
  - `henkan(yomi, callback)`: 読みから候補を検索
  - `runLisp(yomi, callback)`: Lisp式を評価

### Lisp評価器（`lib/lisp/`）
関数型スタイル（kansuu.jsライブラリ）で実装されたインタープリタ:

- `parser.js`: パーサーコンビネータによるLispパーサー
- `exp.js`: 式のデータ型定義（パターンマッチ用）
- `semantics.js`: 式の評価（Eitherモナドでエラーハンドリング）
- `env.js`: 環境（変数束縛）の管理。prelude関数（succ, +, -, *, /, today!, now!等）を定義
- `interpreter.js`: 最上位インターフェース（run, compile）

### 辞書シード
- `bin/seed.js`: `resource/`配下のSKK辞書ファイル（EUC-JP）をMongoDBに投入

## 技術スタック

- **ランタイム**: Node.js v8.1.3
- **データベース**: MongoDB（mongoose経由）
- **テスト**: Mocha + expect.js + should.js
- **関数型ライブラリ**: kansuu.js（List, Pair, Either, Maybeモナド等）

## SKKプロトコル

リクエストの先頭1文字がコマンド:
- `0`: 切断要求
- `1` + 読み: 変換要求。読みが`(`で始まる場合はLisp式として評価
- `2`: バージョン問い合わせ

変換要求で読み中の`_`はスペースに置換される（Lisp式のトークン分離用）。
