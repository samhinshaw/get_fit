/* eslint-env jasmine */
const Request = require('request');

// const server = require('../src/app');

describe('Server', () => {
  // let server;
  beforeAll(() => {
    // use this if we're not
    // eslint-disable-next-line global-require
    // server = require('./app');
  });
  afterAll(() => {
    // server.close();
  });
  describe('GET /', () => {
    const data = {};
    beforeAll(done => {
      Request.get('http://node:8005/', (error, response, body) => {
        data.status = response.statusCode;
        data.body = body;
        done();
      });
    });
    it('Status 200', () => {
      expect(data.status).toBe(200);
    });
    // it('Body', () => {
    //   expect(data.body).toBe('The Polyglot Developer');
    // });
  });
  // describe('GET /test', () => {
  //   const data = {};
  //   beforeAll(done => {
  //     Request.get('http://localhost:3000/test', (error, response, body) => {
  //       data.status = response.statusCode;
  //       data.body = JSON.parse(body);
  //       done();
  //     });
  //   });
  //   it('Status 200', () => {
  //     expect(data.status).toBe(500);
  //   });
  //   it('Body', () => {
  //     expect(data.body.message).toBe('This is an error response');
  //   });
  // });
});
