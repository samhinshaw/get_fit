/* eslint-env jasmine */
import axios from 'axios';

describe('The server', () => {
  // Use localhost if we're in development (running our tests outside of a
  // container), otherwise use node (inside a container)
  let backendHost;
  beforeAll(() => {
    // Set default timeout
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10 * 1000;
    backendHost = process.env.NODE_ENV === 'development' ? 'localhost' : 'node';
  });

  describe('serves /', () => {
    let backendAddress;
    beforeAll(() => {
      backendAddress = `http://${backendHost}:8005/`;
    });
    it('with status 200', done => {
      // eslint-disable-next-line no-console
      console.log(`Connecting to ${backendAddress}`);
      axios
        .get(backendAddress)
        .then(resp => {
          // eslint-disable-next-line no-console
          expect(resp.status).toBe(200);
          done();
        })
        .catch(err => {
          // eslint-disable-next-line no-console
          console.error(err);
          fail(`The request to ${backendAddress} failed.`);
          done();
        });
    });
  });
});
