const { describe, it, before, afterEach } = require('mocha');
const assert = require('assert');
const Request = require('../src/request');
const { createSandbox } = require('sinon');
const Events = require('events');

describe('Request helpers', () => {
  const timeout = 15;
  let sandbox;
  let request;

  //cria nossas variáveis antes de executar os testes
  before(() => {
    sandbox = createSandbox();
    request = new Request();
  });

  //Limpa o estado do sandbox cada "it" executado
  afterEach(() => sandbox.restore());

  it(`should throw a timeout error when the function spend more than ${timeout}ms`, async () => {
    const exceededTimeout = timeout + 10;

    //simula uma chamada que excede o timeout, sendo assim dando REJECT no assert
    sandbox
      .stub(request, request.get.name)
      .callsFake(() => new Promise((r) => setTimeout(r, exceededTimeout)));

    const call = request.makeRequest({
      url: 'https://testing.com',
      method: 'get',
      timeout,
    });

    await assert.rejects(call, { message: 'timeout at [https://testing.com]' });
  });

  it(`should return ok when promise time is ok`, async () => {
    const expected = { ok: 'ok' };

    sandbox.stub(request, request.get.name).callsFake(async () => {
      await new Promise((r) => setTimeout(r));
      return expected;
    });

    const call = () =>
      request.makeRequest({
        url: 'https://testing.com',
        method: 'get',
        timeout,
      });

    await assert.doesNotReject(call());
    assert.deepStrictEqual(await call(), expected);
  });

  it('should return a JSON object after a request', async () => {
    const data = [
      Buffer.from('{"ok": '),
      Buffer.from('"ok"'),
      Buffer.from('}'),
    ];

    //captura o response de callback da classe Request
    const responseEvent = new Events();
    const httpEvent = new Events();

    const https = require('https');
    //yields substitui uma callback
    sandbox
      .stub(https, https.get.name)
      .yields(responseEvent)
      .returns(httpEvent);

    const expect = { ok: 'ok' };
    const pendingPromise = request.get('https://testing.com');

    //manda os dados da variavel "data" uma depois da outra
    responseEvent.emit('data', data[0]);
    responseEvent.emit('data', data[1]);
    responseEvent.emit('data', data[2]);

    responseEvent.emit('end');
  });
});
