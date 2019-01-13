/* eslint-env jasmine */
const Request = require('request');

// const server = require('../src/app');

describe('Server', () => {
  describe('GET /', () => {
    const data = {};
    beforeAll(done => {
      Request.get('http://node:8005/', (error, response, body) => {
        if (error) console.error(error); // eslint-disable-line no-console
        data.status = response.statusCode;
        data.body = body;
        done();
      });
    });
    it('Status 200', () => {
      expect(data.status).toBe(200);
    });
  });
});
