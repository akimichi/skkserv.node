'use strict';

const expect = require('expect.js'),
  net = require('net');
const service = require('../lib/service.js');

describe('SKKサービス', () => {
  const skkService = service.skk;
  const testPort = 11112;
  // サーバーインスタンスはテスト毎に再利用する
  let testServer = null;

  beforeEach(() => {
    testServer = net.createServer(skkService);
    testServer.listen(testPort, '127.0.0.1', () => {
      const addr = testServer.address();
      console.log(`Start a Test Server - ${addr.address}:${addr.port}`);
    });
  });
  afterEach(() => {
     testServer.close();
  });

  it('リクエスト"2 "でバージョンを返す', (done)  => {
    const testClient = net.connect(testPort, () => {
      testClient.write("2 ");
    });
    testClient.on('data', (response) => {
      expect(
        response.toString()
      ).to.equal(
        '0.0.1 '
      )
      done();
    });
  });
  // it('should receive a message event from single data event', (done)  => {
  //   const testClient = net.connect(testPort, () => {
  //     testClient.write("abcdefg");
  //   });
  //   testClient.on('data', (response) => {
  //     expect(
  //       response.toString()
  //     ).to.equal(
  //       'abcdefg'
  //     )
  //     done();
  //   });
  // });
});
describe('echoサービス', () => {
  const echoService = service.echo;
  const testPort = 11113;
  // サーバーインスタンスはテスト毎に再利用する
  let testServer = null;

  beforeEach(() => {
    testServer = net.createServer(echoService);
    testServer.listen(testPort, '127.0.0.1', () => {
      const addr = testServer.address();
      console.log(`Start a Test Server - ${addr.address}:${addr.port}`);
    });
  });
  afterEach(() => {
     testServer.close();
  });

  it('リクエストと同じ内容を返す', (done)  => {
    const testClient = net.connect(testPort, () => {
      testClient.write("this is a test");
    });
    testClient.on('data', (response) => {
      expect(
        response.toString()
      ).to.equal(
        'this is a test'
      )
      done();
    });
  });
});
