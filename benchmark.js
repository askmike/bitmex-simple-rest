const Bitmex = require('./');
const now = require('performance-now');

// fake keys with real key lengths
const key = 'xxxx_xxxxxxxxxxxxxxxxxxx';
const secret = 'xxxx_xxxxxxxxxxxxxxxxxx_xxxx_xxxxxxxxxxxxxxxxxxx';

var bm = new Bitmex({
  key,
  secret
});


const test = () => {
  const start = now();
  const d = bm.createDraft({
    method: 'POST',
    path: '/order', 
    data: {
      symbol: 'XBTUSD',
      orderQty: 100 + i,
      side: 'Sell',
      ordType: 'Limit',
      price: 10000 - i,
      execInst: 'ParticipateDoNotInitiate',
      clOrdID: 'moon-' + i
    }
  });
  console.log('drafting took', (now() - start).toFixed(5), 'ms');
}

let i = 0;
const limit = 30;
const loop = setInterval(() => {
  if(i++ > limit) {
    return clearInterval(loop);
  }

  setTimeout(test, 100);
}, 200);