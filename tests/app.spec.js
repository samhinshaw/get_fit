/* eslint-env jasmine */
/* eslint-disable no-console */
import axios from 'axios';

const FormData = require('form-data');

const waitTimes = {
  // wait a long time for the login, since we increased our bcrypt cost factor significantly
  LOGIN: 10 * 1000,
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

  describe('unauthenticated requests', () => {
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
        'should log in the user when given correct credentials and set a session cookie',
        done => {
          axios
            .post(route, form, { headers: form.getHeaders() })
            .then(resp => {
              expect(resp.status).toBe(200);
              expect(resp.headers['set-cookie']).toBeTruthy();
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
            .post(route, form, {
              headers: form.getHeaders(),
              maxRedirects: 0,
              validateStatus: null,
            })
            .then(res => {
              expect(res.status).toBe(302);
              expect(res.headers.location).toBe('/overview');
              done();
            })
            .catch(err => {
              fail(err);
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
          .get(route, { maxRedirects: 0, validateStatus: null })
          .then(res => {
            expect(res.status).toBe(302);
            expect(res.headers.location).toBe('/login');
            done();
          })
          .catch(err => {
            fail(err);
            done();
          });
      });
    });
  });

  describe('authenticated requests', () => {
    let authCookie = '';
    beforeAll(done => {
      const route = `${address}/login`;
      const loginForm = new FormData();
      loginForm.append('username', 'john');
      loginForm.append('password', 'testpassword');

      axios
        .post(route, loginForm, {
          headers: loginForm.getHeaders(),
          withCredentials: true,
          maxRedirects: 0,
          validateStatus: null,
        })
        .then(res => {
          if (res.headers.location === '/overview') {
            const cookies = res.headers['set-cookie'] || [];
            authCookie = cookies.find(cookie => cookie.includes('connect.sid'));
          } else {
            throw new Error('authentication unsuccessful');
          }
          done();
        });
    }, waitTimes.LOGIN);

    describe('the user page', () => {
      let route;
      beforeAll(() => {
        route = `${address}/user`;
      });

      xit('should render for authenticated requests', done => {
        axios
          .get(route, {
            headers: {
              Cookie: authCookie,
            },
            maxRedirects: 0,
            validateStatus: null,
          })
          .then(res => {
            expect(res.status).toBe(302);
            expect(res.headers.location).toBe('/user');
            done();
          })
          .catch(err => {
            fail(err);
            done();
          });
      });
    });
  });
});
