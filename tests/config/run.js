import Jasmine from 'jasmine';
import { SpecReporter } from 'jasmine-spec-reporter';
import tcpPortUsed from 'tcp-port-used';

// Instantiate Jasmine
const jasmine = new Jasmine();

// Find the backend address for the given environment
const backendHost = process.env.NODE_ENV === 'development' ? 'localhost' : 'node';

jasmine.loadConfigFile('tests/config/jasmine.json');

// Set default timeout
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10 * 1000;

// remove default reporter logs
jasmine.clearReporters();

// add jasmine-spec-reporter
jasmine.addReporter(
  new SpecReporter({
    spec: {
      displayPending: true
    }
  })
);

// Don't start the tests until the Node.js server is up and running
tcpPortUsed.waitUntilUsedOnHost(8005, backendHost).then(
  () => {
    // Then start tests
    jasmine.execute();
  },
  err => {
    // Otherwise log errors
    // eslint-disable-next-line no-console
    console.error('Error on check:', err.message);
  }
);
