# Bitmex-simple-rest

    npm install bitmex-simple-rest

API wrapper for the [Bitmex REST API](https://www.bitmex.com/api/explorer/). Please refer to [their documentation](https://www.bitmex.com/api/explorer/) for all calls explained. Check out `sample.js` for some example calls.

This is a low level wrapper with zero dependencies focussed on:

- Speed
  - Uses keep-alive
  - Disables Nagle's algorithm
  - No complex code
  - No third party libraries
- Userland control
  - Passes on response headers such as information on your [rate limit quota](https://www.bitmex.com/app/restAPI#Request-Rate-Limits)
  - Allows you to specity timeout & expiration date per call

Used by my low latency market maker that's running in production. I don't think you can go much faster in nodejs without rewriting [Node.js' core http library](https://nodejs.org/api/http.html#http_http_request_options_callback) (if you think you can, feel free to open an issue or propose a PR).

## Usage

    // your api key & secret
    const key = 'x';
    const secret = 'y';

    const BitmexRest = require('bitmex-simple-rest');
    const bm = new BitmexRest({
      key,
      secret,

      // these are optional
      timeout: 90 * 1000, // ms - when this lib should timeout the call
      expiration: 60 * 1000, // ms - after how many ms bitmex should refuse this call
      userAgent: 'bearwhale' // string - custom ua
    });

    const { data, headers } = await bm.request({
      path: '/user/margin',
      method: 'GET',
      data: { currency: 'XBt' }
    });

## Final

If this library is helping you trade better on Bitmex feel free to use [my ref link](https://www.bitmex.com/register/VDPANj). You'll get a 10% fee discount for the first 6 months, lowering your market fees (on the perpetual swap) from 0.075% to a mere 0.0675%!