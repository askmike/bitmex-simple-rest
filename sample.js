var Bitmex = require('./');

var bm = new Bitmex();

bm.trade('XBTUSD', { reverse: true }, (err, trades) => console.log(trades));