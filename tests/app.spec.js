/* eslint-env jasmine */
/* eslint-disable no-console */
import axios from 'axios';

import request from 'request-promise-native';

import cheerio from 'cheerio';

const TEST_USER_NAME = 'john';

const loginForm = {
  username: TEST_USER_NAME,
  password: 'testpassword',
};

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

      beforeEach(() => {});

      xit(
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
          request
            .post(route, {
              form: loginForm,
              followAllRedirects: true,
            })
            .then(res => {
              const $ = cheerio.load(res);
              const results = $('.hero-body').find('.title');
              console.log(results.length);
              done();
            })
            .catch(err => {
              done.fail(err);
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
        request
          .get(route, { followAllRedirects: true })
          .then(res => {
            const $ = cheerio.load(res);
            const loginPageSection = $('body').find('.login-page').length > 0;
            expect(loginPageSection).toBe(
              true,
              'at least one ".login-page" element should exist on the page'
            );
            done();
          })
          .catch(err => {
            done.fail(err);
          });
      });
    });
  });

  describe('authenticated requests', () => {
    const cookieJar = request.jar();
    beforeAll(done => {
      const route = `${address}/login`;

      // log in and put the cookies in the cookie jar
      request
        .post(route, {
          form: loginForm,
          followAllRedirects: true,
          jar: cookieJar,
        })
        .then(() => {
          done();
        })
        .catch(() => {
          throw new Error('authentication unsuccessful');
        });
    }, waitTimes.LOGIN);

    describe('the user page', () => {
      let route;
      beforeAll(() => {
        route = `${address}/user`;
      });

      it("should contain the user's username", done => {
        request
          .get(route, { jar: cookieJar })
          .then(res => {
            const $ = cheerio.load(res);
            const title = $('#userTitle').text();
            expect(title.toLowerCase()).toContain(TEST_USER_NAME.toLowerCase());
            done();
          })
          .catch(err => {
            done.fail(err);
          });
      });
    });
  });
});
