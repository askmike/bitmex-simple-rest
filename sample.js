var Bitmex = require('./');

const key = 'x';
const secret = 'y';

var bm = new Bitmex({
  key,
  secret,

  timeout: 90 * 1000,
  expiration: 60 * 1000,
  userAgent: 'bearwhale'
});

bm.request({
  path: '/user/margin',
  method: 'GET',
  data: { currency: 'XBt' }
})
  .then(console.log)
  .catch(console.error);