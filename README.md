skkserv.node
============

## 概要

- Node.jsで実装されたSKKサーバー
- 辞書データはサーバー起動時にメモリに読み込まれる
- 内部にLisp評価器を含み、SKKプロトコルに加えてLisp式の評価も可能(experimental)

## 起動

~~~
# 開発サーバー起動（ポート1179）
npm run start

# 本番サーバー起動（ポート1178）
npm run start-prod
~~~

## test

~~~
# テスト実行
npm test

# 特定のテストファイルを実行
NODE_ENV=test npx mocha --require ts-node/register test/lisp/interpreter.spec.ts
~~~


