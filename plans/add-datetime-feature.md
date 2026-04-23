# 日付・時刻評価器（`@`前置記号）設計プラン

## Context

既存のSKKサーバーにはLisp評価器（`(`前置）と四則演算評価器（`=`前置）がある。Lisp評価器には`today!`と`now!`があるが、`(today!_0)`のようにLisp構文が必要で手軽ではない。`@`前置の日付・時刻評価器を追加することで、`@today`のように直感的に日付・時刻を入力できるようにする。

## アーキテクチャ方針

**パーサーコンビネータによるメソッドチェーン方式を採用する。**

既存のarith/lispパーサーと同様にパーサーコンビネータで構文解析を行い、`primary.method`形式の式を評価する。`lib/datetime/`ディレクトリに`parser.ts`, `exp.ts`, `semantics.ts`, `interpreter.ts`を配置し、既存評価器と同じ構造に従う。

## 文法

```
expression  := primary ('.' method)?
primary     := keyword | era_ref | date_literal | year_month | year_literal
keyword     := 'today' | 'now' | 'yesterday' | 'tomorrow' | 'kyou' | 'ashita' | 'kinou'
era_ref     := [RHTMS] DIGITS            -- R8, H31, S64, T15, M45
date_literal := YYYY '-' MM '-' DD        -- 2026-04-23
year_month  := YYYY '-' MM               -- 2026-10
year_literal := YYYY                      -- 2026
method      := 'wareki' | 'seireki' | 'weekday' | 'month'
```

**メソッドは最大1つ。** チェーン深度を制限してシンプルに保つ。

## 式の型（内部表現）

primaryのパース結果は以下のいずれか:
- `date(year, month, day)` — 完全な日付（today, yesterday, tomorrow, date_literal）。日本語フォーマット時は曜日付き
- `yearMonth(year, month)` — 年月（year_month）
- `year(value)` — 年のみ（year_literal, era_ref→内部で西暦年に変換）
- `time()` — 現在時刻（now）
- `eraYear(prefix, year)` — 元号年（R8等、seirekiメソッド用）

## 使用例

### メソッドなし（デフォルト: 複数形式を候補として返す）

| 入力 | 出力 |
|------|------|
| `@today` | `["2026-04-23", "2026/04/23", "2026年4月23日(水)", "令和8年4月23日(水)"]` |
| `@kyou` | `@today`と同じ |
| `@now` | `["15:30:45", "15時30分45秒", "午後3時30分"]` |
| `@yesterday` | todayと同形式で前日（曜日付き） |
| `@tomorrow` | todayと同形式で翌日（曜日付き） |
| `@2026` | `["2026年", "令和8年"]` |
| `@R8` | `["令和8年", "2026年"]` |
| `@2026-10` | `["2026年10月", "令和8年10月"]` |

### メソッドあり（特定の変換を適用）

| 入力 | 意味 | 出力 |
|------|------|------|
| `@today.wareki` | 今日を和暦で | `["令和8年4月23日(水)"]` |
| `@today.weekday` | 今日の曜日 | `["水曜日", "水", "Wednesday", "Wed"]` |
| `@today.month` | 今月の月名 | `["4月", "April", "Apr", "卯月"]` |
| `@2026-10.wareki` | 年月を和暦に | `["令和8年10月"]` |
| `@2026.wareki` | 年を和暦に | `["令和8年", "R8"]` |
| `@R8.seireki` | 和暦→西暦 | `["2026年", "2026"]` |
| `@1989.wareki` | 跨り年 | `["昭和64年", "平成元年", "S64", "H1"]` |

### メソッドの適用可否

| メソッド | date | yearMonth | year | eraYear | time |
|---------|------|-----------|------|---------|------|
| wareki | o | o | o | - | x |
| seireki | - | - | - | o | x |
| weekday | o | x | x | x | x |
| month | o | o | x | x | x |

`-`は意味がない組み合わせ（エラー）、`x`は型が合わない（エラー）。

## 対応元号

| 元号 | 略称 | 開始日 | 終了日 |
|------|------|--------|--------|
| 明治 | M | 1868-01-25 | 1912-07-29 |
| 大正 | T | 1912-07-30 | 1926-12-24 |
| 昭和 | S | 1926-12-25 | 1989-01-07 |
| 平成 | H | 1989-01-08 | 2019-04-30 |
| 令和 | R | 2019-05-01 | 現在 |

**重要ルール:** 各元号の1年目は「元年」と表記する（「1年」ではない）。

## エラーハンドリング

- 未知のキーワード → `Either.left("未知の日時キーワード: <keyword>")`
- 1868年未満の年 → `Either.left("明治以前の元号には対応していません")`
- 不正な元号形式 → `Either.left("元号の形式が不正です: <input>")`

## ファイル構成

### 新規作成
- `lib/datetime/exp.ts` — 式のデータ型（date, yearMonth, year, eraYear, time, methodCall）
- `lib/datetime/parser.ts` — パーサーコンビネータ（arith/parser.tsの基盤を再利用）
- `lib/datetime/semantics.ts` — 式の評価（フォーマット生成、元号変換）
- `lib/datetime/interpreter.ts` — 最上位インターフェース（run関数）
- `lib/datetime/era.ts` — 元号テーブルと変換ロジック
- `test/datetime/parser.spec.ts` — パーサーの単体テスト
- `test/datetime/era.spec.ts` — 元号変換の単体テスト
- `test/datetime/interpreter.spec.ts` — 評価器全体の統合テスト

### 変更
- `lib/dictionary.ts` — `runDatetime`ラッパー追加
- `lib/service.ts` — `@`前置のルーティング分岐追加
- `test/service.spec.ts` — `1@today`等の統合テスト追加

## パーサーの基盤について

`lib/arith/parser.ts`にあるパーサーコンビネータの基本要素（pure, zero, flatMap, alt, sat, char, many, many1, token等）は`lib/datetime/parser.ts`でも必要になる。選択肢:
1. **arith/parser.tsから共通部分を`lib/parser.ts`に抽出** — DRYだがリファクタリングが大きい
2. **datetime/parser.tsにarithの基盤をコピーして拡張** — 重複するが変更範囲が小さい

→ まずは方式2で進め、将来的に共通化を検討する。

## 実装順序

1. `lib/datetime/era.ts` + テスト（元号変換ロジック単体で検証）
2. `lib/datetime/exp.ts` — 式のデータ型定義
3. `lib/datetime/parser.ts` + テスト（パーサーコンビネータとパース規則）
4. `lib/datetime/semantics.ts` — 式の評価
5. `lib/datetime/interpreter.ts` + テスト（統合テスト）
6. `lib/dictionary.ts` に `runDatetime` 追加
7. `lib/service.ts` に `@` ルーティング追加
8. `test/service.spec.ts` に統合テスト追加
9. `npx tsc --noEmit` と `npm test` で検証

## 設計決定事項

- [x] 日本語エイリアス（kyou/ashita/kinou）→ **対応する**（英語・日本語両方）
- [x] `seireki`でひらがな入力 → **ローマ字略称のみ**（R8, H31等）
- [x] `@datetime`（日付+時刻複合）→ **不要**
- [x] 月名 → **monthメソッドとして提供**
- [x] 干支 → **不要**（削除）
- [x] 文法 → **`primary.method`形式**（パーサーコンビネータ使用）
- [x] メソッドチェーン深度 → **最大1つ**
- [x] メソッドなしのデフォルト → **複数形式を候補として返す**
- [x] primary → **西暦リテラル・元号参照・キーワードの全てをサポート**
- [x] 跨り年（1989等）→ **両方の元号を候補として返す**
