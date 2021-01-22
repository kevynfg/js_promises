const { rejects } = require('assert');
const https = require('https');

class Request {
  //closure function
  //quando der erro, chamar o errorTimeout da request efetuada
  errorTimeout = (reject, urlRequest) => () =>
    reject(new Error(`timeout at [${urlRequest}]`));

  //só vai ser chamado quando o timeout terminar
  raceTimeoutDelay(url, timeout) {
    return new Promise((resolve, reject) => {
      setTimeout(this.errorTimeout(reject, url), timeout);
    });
  }

  async get(url) {
    //Exemplo de como a 'WEB' trabalha com requests de API
    //Recebendo vários Buffer com pedaços dos dados e ao final
    //Faz um join com todos os "pedaços" de dados e ajunta todos eles
    return new Promise((resolve, reject) => {
      https
        .get(url, (res) => {
          const items = [];
          res
            .on('data', (data) => items.push(data))
            .on('end', () => resolve(JSON.parse(items.join(''))));
        })
        .on('error', reject);
    });
  }

  async makeRequest({ url, method, timeout }) {
    return Promise.race([
      this[method](url),
      this.raceTimeoutDelay(url, timeout),
    ]);
  }
}

module.exports = Request;
