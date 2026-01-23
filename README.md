skkserv.node
============

## 概要

node.jsで書かれたskkサーバーである。
内部にlisp評価器を含む。



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

