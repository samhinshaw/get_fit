/* eslint-env jasmine */
import axios from 'axios';

describe('Server', () => {
  // Use localhost if we're in development (running our tests outside of a
  // container), otherwise use node (inside a container)
  let backendAddress;
  beforeAll(() => {
    backendAddress = process.env.NODE_ENV === 'development' ? 'localhost' : 'node';
  });

  describe('GET /', () => {
    it('Status 200', done => {
      console.log(`Connecting to http://${backendAddress}:8005/`);
      axios
        .get(`http://${backendAddress}:8005/`)
        .then(resp => {
          // eslint-disable-next-line no-console
          console.warn(resp);
          expect(resp.status).toBe(200);
          done();
        })
        .catch(err => {
          // eslint-disable-next-line no-console
          console.error(err);
          fail('The request failed.');
          done();
        });
    });
  });
});
