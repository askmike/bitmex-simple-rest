# Bitmex-simple-rest

    npm install bitmex-simple-rest

A basic API wrapper for the [Bitmex REST API](https://www.bitmex.com/api/explorer/). Please refer to [their documentation](https://www.bitmex.com/api/explorer/) for all calls explained. Check out `example.js` for a list of all possible calls and their parameters.

This is a low level wrapper with zero dependencies focussed on:

- Speed
  - Uses keep-alive
  - Disables Nagle's algorithm
  - No complex code
  - No third party libraries
- Userland control
  - Passes on response headers such as information on your [rate limit quota](https://www.bitmex.com/app/restAPI#Request-Rate-Limits))
  - Allows you to specity timeout & expiration date per call

In development, but used by my market maker that's running in production.

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