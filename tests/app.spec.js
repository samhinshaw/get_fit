/* eslint-env jasmine */
/* eslint-disable jasmine */
import axios from 'axios';

describe('The server', () => {
  // If we're in test, use `node` (will allow networking between Docker
  // containers). Otherwise, if we're in development or there is no NODE_ENV
  // (running outside a container, perhaps), use `localhost`
  let address;
  beforeAll(() => {
    // Set default timeout
    const host = process.env.NODE_ENV === 'test' ? 'node' : 'localhost';
    address = `http://${host}:8005`;
  });

  describe('serves /', () => {
    let route;
    beforeAll(() => {
      route = `${address}/`;
    });

    it('with status 200', done => {
      axios
        .get(route)
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

  describe('serves /user', () => {
    let route;
    beforeAll(() => {
      route = `${address}/user`;
    });

    it('with status 200', done => {
      axios
        .get(route)
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
});
