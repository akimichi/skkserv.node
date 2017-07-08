'use strict';

const expect = require('expect.js'),
  net = require('net');
const service = require('../lib/service.js');

describe('service.js', () => {
  let testServer = null;
  let testClient = null;

  // beforeEach(() => {
    testServer = service.create();
    testServer.listen(11112, '127.0.0.1', () => {
      const addr = testServer.address();
      console.log(`Listening Start on Test Server - ${addr.address}:${addr.port}`);
    });
  // });

  it('should receive a message event from single data event', (done)  => {
    testClient = net.connect(11112, () => {
      testClient.write("abcdefg");
    });
    testClient.on('data', (response) => {
      expect(
        response.toString()
      ).to.equal(
        'abcdefg'
      )
      testServer.close();
      done();
    });
  });
});
