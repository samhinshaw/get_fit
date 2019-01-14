/* eslint-env jasmine */
const Request = require('request');

// const server = require('../src/app');

describe('Server', () => {
  describe('GET /', () => {
    const data = {};
    beforeAll(done => {
      console.log('Getting http://node:8005/');
      Request.get('http://node:8005/', (error, response, body) => {
        if (error) console.error(error);
        console.log(response);
        data.status = response.statusCode;
        data.body = body;
        done();
      });
    });
    it(
      'Status 200',
      () => {
        expect(data.status).toBe(200);
      },
      10000
    );
  });
});
