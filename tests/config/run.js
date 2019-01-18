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
tcpPortUsed
  .waitUntilUsedOnHost(
    // look for port 8005
    8005,
    // on our target host, either "localhost" or "node"
    backendHost,
    // wait 100ms between pings
    5 * 1000,
    // wait 20sec in total for the port to be used
    20 * 1000
  )
  // Then start tests
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Waiting for backend to be available...');
    // Then wait another 10 seconds for good measure
    setTimeout(() => {
      jasmine.execute();
    }, 10 * 1000);
  })
  // Otherwise log errors
  // eslint-disable-next-line no-console
  .catch(err => console.error('Error on check:', err.message));
