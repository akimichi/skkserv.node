skkserv.node
============

## 概要

node.jsで書かれたskkサーバーである。

- バックエンドDBは、mongodb
- lisp式の評価が可能(experimental)

## 事前準備

1. mongodbサーバーを準備する
1. .env を作成し、MONGODB_URI を設定する


## production 

~~~
$ npm run seed
$ npm run start
~~~


## test

~~~
$ nvm use
$ npm test
~~~


