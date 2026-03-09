# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Node.jsで実装されたSKKサーバー。内部にLisp評価器を含み、SKKプロトコルに加えてLisp式の評価も可能。辞書データはサーバー起動時にメモリに読み込まれる。

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
```

## アーキテクチャ

### サーバー層
- `server.js`: エントリーポイント。起動時に辞書ファイルを読み込み、TCPサーバーを起動
- `lib/service.js`: SKKプロトコルの処理。コマンド0（切断）、1（変換）、2（バージョン）を実装
- `lib/config.js`: 環境別（test/development/production）の設定管理

### データ層
- `lib/dictionary.js`: メモリ辞書モジュール（JavaScript Map）
  - `load(paths)`: 辞書ファイル（EUC-JP）を読み込んでMapに格納
  - `henkan(yomi)`: 読みから候補を検索（Promise）
  - `runLisp(yomi)`: Lisp式を評価（Promise）
  - `clear()`: 辞書をクリア（テスト用）
  - `add(yomi, candidates)`: エントリを追加（テスト用）
  - `size()`: エントリ数を取得

### Lisp評価器（`lib/lisp/`）
関数型スタイル（kansuu.jsライブラリ）で実装されたインタープリタ:

- `parser.js`: パーサーコンビネータによるLispパーサー
- `exp.js`: 式のデータ型定義（パターンマッチ用）
- `semantics.js`: 式の評価（Eitherモナドでエラーハンドリング）
- `env.js`: 環境（変数束縛）の管理。prelude関数（succ, +, -, *, /, today!, now!等）を定義
- `interpreter.js`: 最上位インターフェース（run, compile）

### 辞書ファイル
`resource/`配下のEUC-JP形式SKK辞書ファイル。サーバー起動時に自動的に読み込まれる:

- `SKK-JISYO.L`: 汎用辞書（大規模）
- `SKK-JISYO.drug`: 医薬品辞書
- `SKK-JISYO.fullname`: 人名辞書
- `SKK-JISYO.geo`: 地名辞書
- `SKK-JISYO.zipcode`: 郵便番号辞書
- `SKK-JISYO.law`: 法律用語辞書
- `SKK-JISYO.station`: 駅名辞書
- `SKK-JISYO.jinmei`: 人名用漢字辞書
- `SKK-JISYO.medical`: 医学用語辞書

辞書ファイル形式: `読み /候補1/候補2/.../`

## 技術スタック

- **ランタイム**: Node.js v8.1.3
- **辞書**: メモリ格納（JavaScript Map）
- **テスト**: Mocha + expect.js + should.js
- **関数型ライブラリ**: kansuu.js（List, Pair, Either, Maybeモナド等）
- **文字コード変換**: iconv-lite（EUC-JP → UTF-8）

## SKKプロトコル

リクエストの先頭1文字がコマンド:
- `0`: 切断要求
- `1` + 読み: 変換要求。読みが`(`で始まる場合はLisp式として評価
- `2`: バージョン問い合わせ

変換要求で読み中の`_`はスペースに置換される（Lisp式のトークン分離用）。

## テスト

単体テスト

npm test

SKKサーバーのテスト

echo "1あい" | nc localhost 1179
-> 1/愛/藍/相/ が返る
