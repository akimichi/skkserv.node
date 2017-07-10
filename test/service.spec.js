'use strict';

const expect = require('expect.js'),
  net = require('net');
const service = require('../lib/service.js');

describe('service.js', () => {
  const testPort = 11112;
  // テスト毎に再利用する可変な変数
  let testServer = null;

  beforeEach(() => {
    testServer = net.createServer(service);
    testServer.listen(testPort, '127.0.0.1', () => {
      const addr = testServer.address();
      console.log(`Start a Test Server - ${addr.address}:${addr.port}`);
    });
  });
  afterEach(() => {
     testServer.close();
  });

  it('should receive a message event from single data event', (done)  => {
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
