# 四則演算評価器 実装プラン

## Context

`lib/lisp/` に既存のLisp評価器がある。これと同じアーキテクチャパターン（Church符号化による式の型、モナディックパーサーコンビネータ、Eitherモナドによるエラーハンドリング）を用いて、中置記法の四則演算評価器を `lib/arith/` に実装する。

## 文法

```
expression = term (('+' | '-') term)*
term       = factor (('*' | '/') factor)*
factor     = number | '(' expression ')'
number     = float | int  （負の数を含む）
```

- `*` `/` は `+` `-` より優先順位が高い（termレベルで解析）
- 左結合: `1 - 2 - 3` = `(1 - 2) - 3`
- 括弧で優先順位を上書き可能

## 作成ファイル

### `lib/arith/exp.ts` — 式のデータ型

Church符号化パターンマッチによる5つのバリアント:

```typescript
interface ExpPattern<T> {
  num?: (value: number) => T;
  add?: (left: Exp, right: Exp) => T;
  subtract?: (left: Exp, right: Exp) => T;
  multiply?: (left: Exp, right: Exp) => T;
  divide?: (left: Exp, right: Exp) => T;
}
type Exp = <T>(pattern: ExpPattern<T>) => T;
```

コンストラクタ: `num`, `add`, `subtract`, `multiply`, `divide`, `match`

### `lib/arith/parser.ts` — 中置記法パーサー

`lib/lisp/parser.ts` からパーサーコンビネータの基盤（`pure`, `flatMap`, `zero`, `item`, `sat`, `char`, `many`, `plus`, `alt`, `token`, `spaces`, `junk`, `parse`, `nat`, `int`, `float`, `numeric`, `digit`, `some` 等）を複製し、以下の中置記法用パーサーを追加:

- `number`: `numeric` をラップし `Exp.num(value)` を生成
- `factor`: `number | '(' expression ')'`
- `term`: `factor (('*' | '/') factor)*` — 左畳み込みで `Exp.multiply` / `Exp.divide` を構築
- `expression`: `term (('+' | '-') term)*` — 左畳み込みで `Exp.add` / `Exp.subtract` を構築

左畳み込みは `List.toArray` + `Array.reduce` で実装（kansuu.jsの `List.foldl` の有無に依存しない）。

### `lib/arith/semantics.ts` — 評価器

環境不要のシンプルな再帰評価。Eitherモナドでエラーハンドリング。ゼロ除算は `Either.left` でエラーを返す。

### `lib/arith/interpreter.ts` — 最上位インターフェース

- `run(input: string): Either` — 文字列をパースして評価（環境引数なし）
- `compile(input: string): Exp` — 文字列をパースしてASTを返す

### `test/arith/exp.spec.ts`

- num, add, subtract, multiply, divide の構築とパターンマッチの検証
- ネストした式の構造検証

### `test/arith/parser.spec.ts`

- 数値リテラル: `"42"`, `"3.14"`, `"-5"`
- 単純な四則演算: `"1 + 2"`, `"5 - 3"`, `"3 * 4"`, `"10 / 2"`
- 演算子の優先順位: `"1 + 2 * 3"` → `add(num(1), multiply(num(2), num(3)))`
- 左結合: `"1 - 2 - 3"` → `subtract(subtract(num(1), num(2)), num(3))`
- 括弧: `"(1 + 2) * 3"` → `multiply(add(num(1), num(2)), num(3))`
- 空白の処理: `"  1  +  2  "`

### `test/arith/semantics.spec.ts`

- 各演算の基本評価（正常系）
- 負の結果、浮動小数点の結果
- ゼロ除算エラー
- ネストした式の評価

### `test/arith/interpreter.spec.ts`

- compile: ASTの構造検証
- run: 端から端の評価テスト
  - 基本四則演算、優先順位、括弧、左結合
  - 浮動小数点、負の数
  - ゼロ除算エラー、パースエラー

## 実装順序

1. `lib/arith/exp.ts` → `test/arith/exp.spec.ts` — テスト通過を確認
2. `lib/arith/parser.ts` → `test/arith/parser.spec.ts` — テスト通過を確認
3. `lib/arith/semantics.ts` → `test/arith/semantics.spec.ts` — テスト通過を確認
4. `lib/arith/interpreter.ts` → `test/arith/interpreter.spec.ts` — テスト通過を確認

各ステップでテストを実行し、通過を確認してから次に進む。

## 検証方法

```bash
# 全テスト実行
npm test

# arithのテストのみ実行
NODE_ENV=test npx mocha --require ts-node/register --recursive 'test/arith/**/*.ts'

# 個別テスト
NODE_ENV=test npx mocha --require ts-node/register test/arith/exp.spec.ts
NODE_ENV=test npx mocha --require ts-node/register test/arith/parser.spec.ts
NODE_ENV=test npx mocha --require ts-node/register test/arith/semantics.spec.ts
NODE_ENV=test npx mocha --require ts-node/register test/arith/interpreter.spec.ts

# TypeScriptコンパイルチェック
npx tsc --noEmit
```
