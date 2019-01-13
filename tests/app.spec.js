/* eslint-env jasmine */
const Request = require('request');

// const server = require('../src/app');

describe('Server', () => {
  describe('GET /', () => {
    it('Status 200', done => {
      Request.get('http://node:8005/', (error, response) => {
        if (error) console.error(error); // eslint-disable-line no-console
        if (response) {
          expect(response.statusCode).toBe(200);
          done();
        } else {
          fail();
          done();
        }
      });
    });
  });
});
