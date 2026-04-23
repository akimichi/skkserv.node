import expect = require('expect.js');
import net = require('net');
import service = require('../lib/service');

describe('SKKサービス', () => {
  const skkService = service.skk;
  const testPort = 11112;
  let testServer: net.Server | null = null;

  beforeEach(() => {
    testServer = net.createServer(skkService);
    testServer.listen(testPort, '127.0.0.1', () => {
      const addr = testServer!.address() as net.AddressInfo;
      console.log(`Start a Test Server - ${addr.address}:${addr.port}`);
    });
  });
  afterEach(() => {
    testServer!.close();
  });

  it('リクエスト"1=2+3"で四則演算の結果を返す', function (done) {
    this.timeout('5s');
    const testClient = net.connect(testPort, '127.0.0.1', () => {
      testClient.write("1=2+3 ");
    });
    testClient.on('data', (response) => {
      expect(
        response.toString()
      ).to.equal(
        '1/5/\n'
      )
      done();
    });
  });

  it('リクエスト"1@2026.wareki"で和暦変換の結果を返す', function (done) {
    this.timeout('5s');
    const testClient = net.connect(testPort, '127.0.0.1', () => {
      testClient.write("1@2026.wareki ");
    });
    testClient.on('data', (response) => {
      expect(
        response.toString()
      ).to.equal(
        '1/令和8年/R8/\n'
      )
      done();
    });
  });

  it('リクエスト"1@R8.seireki"で西暦変換の結果を返す', function (done) {
    this.timeout('5s');
    const testClient = net.connect(testPort, '127.0.0.1', () => {
      testClient.write("1@R8.seireki ");
    });
    testClient.on('data', (response) => {
      expect(
        response.toString()
      ).to.equal(
        '1/2026年/2026/\n'
      )
      done();
    });
  });

  it('リクエスト"2 "でバージョンを返す', (done) => {
    const testClient = net.connect(testPort, '127.0.0.1', () => {
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
});
describe('echoサービス', () => {
  const echoService = service.echo;
  const testPort = 11113;
  let testServer: net.Server | null = null;

  beforeEach(() => {
    testServer = net.createServer(echoService);
    testServer.listen(testPort, '127.0.0.1', () => {
      const addr = testServer!.address() as net.AddressInfo;
      console.log(`Start a Test Server - ${addr.address}:${addr.port}`);
    });
  });
  afterEach(() => {
    testServer!.close();
  });

  it('リクエストと同じ内容を返す', (done) => {
    const testClient = net.connect(testPort, '127.0.0.1', () => {
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
