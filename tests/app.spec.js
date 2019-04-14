/* eslint-env jasmine */
/* eslint-disable no-console */
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

      it('should be served properly', done => {
        request
          .get(route, {
            resolveWithFullResponse: true,
          })
          .then(res => {
            const $ = cheerio.load(res.body);
            const appTitle = $('h1.title').text();
            expect(res.statusCode).toBe(200, 'the status code should be 200');
            expect(appTitle.trim()).toBe('Get Fit', 'the app title should be present');
            done();
          })
          .catch(err => {
            done.fail(err);
          });
      });
    });

    describe('the login page', () => {
      let route;
      beforeAll(() => {
        route = `${address}/login`;
      });

      it('should be served properly', done => {
        request
          .get(route, {
            resolveWithFullResponse: true,
          })
          .then(res => {
            const $ = cheerio.load(res.body);
            const loginBox = $('body').find('.login-box');
            expect(res.statusCode).toBe(200, 'the status code should be 200');
            expect(loginBox.length > 0).toBe(true, 'the login box should be present on the page');
            done();
          })
          .catch(err => {
            done.fail(err);
          });
      });

      it(
        'should redirect a user to the overview page when given correct credentials',
        done => {
          request
            .post(route, {
              form: loginForm,
              followAllRedirects: true,
              resolveWithFullResponse: true,
              // Make sure to use a new, unauthenticated cookie jar
              jar: request.jar(),
            })
            .then(res => {
              const $ = cheerio.load(res.body);
              const heroText = $('.hero-body .title').text();
              expect(heroText).toContain('Get Fit');
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
          .get(route, {
            followAllRedirects: true,
            resolveWithFullResponse: true,
            // Make sure to use a new, unauthenticated cookie jar
            jar: request.jar(),
          })
          .then(res => {
            const $ = cheerio.load(res.body);
            const loginBox = $('body').find('.login-box');
            expect(loginBox.length > 0).toBe(true, 'the login box should be present on the page');
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
    // Pre-authenticate
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
          // could check that authentication was unsuccessful here
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
