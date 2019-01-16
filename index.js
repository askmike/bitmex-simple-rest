const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');

const version = require('./package.json').version;
const name = require('./package.json').name;

const BitmexError = require('./bitmexError');

const USER_AGENT = `${name}@${version}`;

class BitmexRest {
  constructor(config) {
    this.ua = USER_AGENT;
    this.timeout = 90 * 1000;
    this.expiration = 60 * 1000;

    // keep-alive
    this.agent = new https.Agent({
      keepAlive: true,
      timeout: 90 * 1000,
      keepAliveMsecs: 1000 * 60
    });

    this.drafts = {};

    if(!config) {
      return;
    }

    if(config.key && config.secret) {
      this.key = config.key;
      this.secret = config.secret;
    }

    if(config.timeout) {
      this.timeout = config.timeout;
    }

    if(config.expiration) {
      this.expiration = config.expiration;
    }

    if(config.userAgent) {
      this.ua += ' | ' + config.userAgent;
    }
  }

  // most code is from:
  // https://github.com/BitMEX/api-connectors/blob/81874dc618f953fd054f2a249f5d03fda3e48093/official-http/node-request/
  // includes this fix: https://github.com/BitMEX/api-connectors/pull/308

  // this fn can easily take more than 1ms due to heavy crypto functions
  // if your application is _very_ latency sensitive prepare the drafts
  // before you realize you want to send them.
  createDraft({path, method, data, expiration, timeout}) {
    if(!expiration) {
      expiration = this.expiration;
    }

    if(!timeout) {
      timeout = this.timeout;
    }

    path = '/api/v1' + path;

    let payload = '';
    if(method === 'POST') {
      payload = JSON.stringify(data);
    } else {
      path += '?' + querystring.stringify(data);
    }

    const start = +new Date;
    const expires = Math.round((start + expiration) / 1000);

    const signature = crypto.createHmac('sha256', this.secret)
      .update(method + path + expires + payload).digest('hex');

    const options = {
      host: 'www.bitmex.com',
      path,
      method,
      agent: this.agent,
      headers: {
        'User-Agent': this.ua,
        'content-type' : 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'api-expires': expires,
        'api-key': this.key,
        'api-signature': signature
      },
      // merely passed through for requestDraft
      timeout,
    };

    return options;
  }

  // a draft is an option object created (potentially previously) with createDraft
  requestDraft(draft) {
    return new Promise((resolve, reject) => {
      const req = https.request(draft, res => {
        res.setEncoding('utf8');
        let buffer = '';
        res.on('data', function(data) {
          // TODO: we receive this event up to ~0.6ms before the end
          // event, though if this is valid json & doesn't contain
          // an error we can return from here, since we dont care
          // about status code.
          buffer += data;
        });
        res.on('end', function() {
          if (res.statusCode >= 300) {
            let message;
            let data;

            try {
              data = JSON.parse(buffer);
              message = data.error.message;
            } catch(e) {
              message = buffer;
            }

            return reject(new BitmexError(message, res, data));
          }

          let data;
          try {
            data = JSON.parse(buffer);
          } catch (err) {
            return reject(new BitmexError(buffer, res));
          }

          resolve({
            data,
            headers: res.headers
          });
        });
      });

      req.on('error', err => {
        reject(err);
      });

      req.on('socket', socket => {
        if(socket.connecting) {
          socket.setNoDelay(true);
          socket.setTimeout(draft.timeout);
          socket.on('timeout', function() {
            req.abort();
          });
        }
      });

      if(draft.method === 'GET') {
        req.end();
      } else {
        req.end(payload);
      }
    });
  }

  // props: {path, method, data, expiration, timeout}
  request(props) {
    return this.requestDraft(this.createDraft(props));
  }
};

module.exports = BitmexRest;