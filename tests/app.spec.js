/* eslint-env jasmine */
import axios from 'axios';

describe('Server', () => {
  describe('GET /', () => {
    const data = {};
    beforeAll(done => {
      // eslint-disable-next-line no-console
      console.log('Getting http://node:8005/');
      axios
        .get('http://node:8005/')
        .then(response => {
          // eslint-disable-next-line no-console
          console.log(response);
          data.status = response.statusCode;
          done();
        })
        .catch(err => {
          // eslint-disable-next-line no-console
          console.error(err);
        });
    });
    it(
      'Status 200',
      () => {
        expect(data.status).toBe(200);
      },
      10000
    );
  });
});
