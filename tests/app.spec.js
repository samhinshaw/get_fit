/* eslint-env jasmine */
/* eslint-disable no-console */
import axios from 'axios';

const FormData = require('form-data');

const waitTimes = {
  // wait a long time for the login, since we increased our bcrypt cost factor significantly
  LOGIN: 30 * 1000,
};

describe('Get Fit', () => {
  // If we're in test, use `node` (will allow networking between Docker
  // containers). Otherwise, if we're in development or there is no NODE_ENV
  // (running outside a container, perhaps), use `localhost`
  let address;
  beforeAll(() => {
    // Set default timeout
    const host = process.env.NODE_ENV === 'test' ? 'node' : 'localhost';
    address = `http://${host}:8005`;
  });

  describe('the home page', () => {
    let route;
    beforeAll(() => {
      route = `${address}/`;
    });

    it('should be served with status 200', done => {
      axios
        .get(route, { maxRedirects: 0 })
        .then(resp => {
          expect(resp.status).toBe(200);
          done();
        })
        .catch(err => {
          console.error(err);
          fail(`The request to ${route} failed.`);
          done();
        });
    });
  });

  describe('the login page', () => {
    let route;
    beforeAll(() => {
      route = `${address}/login`;
    });

    it('should be served with status 200', done => {
      axios
        .get(route, { maxRedirects: 0 })
        .then(resp => {
          expect(resp.status).toBe(200);
          done();
        })
        .catch(err => {
          console.error(err);
          fail(`The request to ${route} failed.`);
          done();
        });
    });

    let form;
    beforeEach(() => {
      form = new FormData();
      form.append('username', 'john');
      form.append('password', 'testpassword');
    });

    it(
      'should log in the user when given correct credentials',
      done => {
        axios
          .post(route, form, { headers: form.getHeaders() })
          .then(resp => {
            expect(resp.status).toBe(200);
            done();
          })
          .catch(err => {
            console.error(err);
            fail(`The request to ${route} failed.`);
            done();
          });
      },
      waitTimes.LOGIN
    );

    it(
      'should redirect a user to the overview page when given correct credentials',
      done => {
        axios
          .post(route, form, { headers: form.getHeaders(), maxRedirects: 0 })
          .then(resp => {
            console.log('it happened');
            fail(`The request did not redirect, status code ${resp.status}.`);
            done();
          })
          .catch(err => {
            console.log('it caught');
            expect(err.response.status).toBe(302);
            expect(err.response.headers.location).toBe('/overview');
            done();
          });
      },
      waitTimes.LOGIN
    );
  });

  describe('the user page', () => {
    let route;
    beforeAll(() => {
      route = `${address}/user`;
    });

    it('should redirect us to the login page', done => {
      axios
        .get(route, { maxRedirects: 0 })
        .then(resp => {
          fail(`The request did not redirect, status code ${resp.status}.`);
          done();
        })
        .catch(err => {
          expect(err.response.status).toBe(302);
          expect(err.response.headers.location).toBe('/login');
          done();
        });
    });
  });
});
