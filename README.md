skkserv.node
============

## 概要

node.jsで書かれたskkサーバーである。

- バックエンドDBは、mongodb
- lisp式の評価が可能


## test


~~~
$ nvm use
$ npm test
~~~

## production 

~~~
$ npm run seed
$ npm run start
~~~


## seed

~~~
$ NODE_DEV=development node bin/seed.js
~~~

