/* eslint-env jasmine */
import axios from 'axios';

describe('Server', () => {
  // Use localhost if we're in development (running our tests outside of a
  // container), otherwise use node (inside a container)
  let backendHost;
  beforeAll(() => {
    backendHost = process.env.NODE_ENV === 'development' ? 'localhost' : 'node';
  });

  describe('GET /', () => {
    let backendAddress;
    beforeAll(() => {
      backendAddress = `http://${backendHost}:8005/`;
    });
    it('Status 200', done => {
      console.log(`Connecting to ${backendAddress}`);
      axios
        .get(backendAddress)
        .then(resp => {
          // eslint-disable-next-line no-console
          console.warn(resp);
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
