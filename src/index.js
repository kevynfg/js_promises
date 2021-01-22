const Request = require('./request');
const request = new Request();

async function scheduler() {
  console.log('starting in...', new Date().toISOString());
  const requests = [
    {
      url: 'https://www.mercadobitcoin.net/api/BTC/ticker/',
      url: 'https://www.NAO_EXISTE.net',
      url: 'https://www.mercadobitcoin.net/api/BTC/orderbook/',
    },
  ]
    //"data" são os dados da API em um array, adiciono timeout
    //e method para poder utilizar na classe Request que recebe três parâmetros
    .map((data) => ({
      ...data,
      timeout: 2000,
      method: 'get',
    }))
    //basta passar params que já está com data, timeout e method
    .map((params) => request.makeRequest(params));

  //allSettled retorna um array, resolve e reject das promises
  const result = await Promise.allSettled(requests);
  const allSucceded = [];
  const allFailed = [];

  //status, value e reason são os resultados do allSettled
  for (const { status, value, reason } of result) {
    if (status === 'rejected') {
      allFailed.push(reason);
      continue;
    }
    allSucceded.push(value);
  }
  console.log({ allFailed, allSucceded: JSON.stringify(allSucceded) });
}

const PERIOD = 2000;
setInterval(scheduler, PERIOD);
