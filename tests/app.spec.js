/* eslint-env jasmine */
import axios from 'axios';

describe('Server', () => {
  describe('GET /', () => {
    it('Status 200', done => {
      axios
        .get('http://localhost:8005/')
        .then(resp => {
          // eslint-disable-next-line no-console
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
