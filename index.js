var querystring = require("querystring");
var https = require('https');
var crypto = require('crypto');

var _ = require('lodash');

_.mixin({
  // compact for objects
  compactObject: function(to_clean) {
    _.map(to_clean, function(value, key, to_clean) {
      if (value === undefined)
        delete to_clean[key];
    });
    return to_clean;
  }
});  

var Bitmex = function(key, secret, client_id) {
  this.key = key;
  this.secret = secret;
  this.client_id = client_id;

  _.bindAll(this);
}

Bitmex.prototype._request = function(method, path, data, args, callback) {
  var options = {
    host: 'www.bitmex.com',
    path: path,
    method: method,
    headers: {
      'User-Agent': 'Mozilla/4.0 (compatible; Bitme node.js client)',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  };

  // if(method === 'post') {
  //   options.headers['Content-Length'] = data.length;
  //   options.headers['content-type'] = 'application/x-www-form-urlencoded';
  // }

  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    var buffer = '';
    res.on('data', function(data) {
      buffer += data;
    });
    res.on('end', function() {
      if (res.statusCode !== 200) {
        return callback(new Error('Bitmex error ' + res.statusCode + ': ' + buffer));
      }
      try {
        var json = JSON.parse(buffer);
      } catch (err) {
        return callback(err);
      }
      callback(null, json);
    });
  });

  req.on('error', function(err) {
    callback(err);
  });

  req.on('socket', function (socket) {
    socket.setTimeout(5000);
    socket.on('timeout', function() {
      req.abort();
    });
    socket.on('error', function(err) {
      callback(err);
    });
  });
  
  req.end(data);

}

Bitmex.prototype._get = function(symbol, action, args, callback) {
  args = _.compactObject(args);
  args.symbol = symbol;

  var path = '/api/v1/' + action;

  var qs = querystring.stringify(args);
  path += (qs === '' ? '/' : '/?') + qs;

  this._request('get', path, undefined, args, callback)
}

// Bitmex.prototype._post = function(market, action, callback, args, legacy_endpoint) {
//   if(!this.key || !this.secret || !this.client_id)
//     return callback(new Error('Must provide key, secret and client ID to make this API request.'));

//   if(legacy_endpoint)
//     var path = '/api/' + action + '/';
//   else {
//     if(market)
//       var path = '/api/v2/' + action + '/' + market + '/';
//     else
//       var path = '/api/v2/' + action + '/';
//   }

//   var nonce = this._generateNonce();
//   var message = nonce + this.client_id + this.key;
//   var signer = crypto.createHmac('sha256', new Buffer(this.secret, 'utf8'));
//   var signature = signer.update(message).digest('hex').toUpperCase();

//   args = _.extend({
//     key: this.key,
//     signature: signature,
//     nonce: nonce
//   }, args);

//   args = _.compactObject(args);
//   var data = querystring.stringify(args);

//   this._request('post', path, data, callback, args);
// }

// 
// Public API
// 

Bitmex.prototype.trade = function(symbol, options, callback) {
  this._get(symbol, 'trade', options || {}, callback);
}


// 
// Private API
// (you need to have key / secret / client ID set)
// 



module.exports = Bitmex;
