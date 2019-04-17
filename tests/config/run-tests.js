/* eslint-disable no-console */

import Jasmine from 'jasmine';
import { SpecReporter } from 'jasmine-spec-reporter';
import tcpPortUsed from 'tcp-port-used';

// Instantiate Jasmine
const jasmine = new Jasmine();

// Find the backend address for the given environment
const host = process.env.NODE_ENV === 'test' ? 'node' : 'localhost';

// Load configuration file
jasmine.loadConfigFile('tests/config/jasmine.json');

// remove default reporter logs
jasmine.clearReporters();

// add jasmine-spec-reporter
jasmine.addReporter(
  new SpecReporter({
    spec: {
      displayPending: true,
    },
  })
);

// Don't start the tests until the Node.js server is up and running
tcpPortUsed
  .waitUntilUsedOnHost(
    // look for port 8005
    8005,
    // on our target host, either "localhost" or "node"
    host,
    // wait 100ms between pings
    5 * 1000,
    // wait 20sec in total for the port to be used
    20 * 1000,
  )
  // Then start tests
  .then(() => jasmine.execute())
  // Otherwise log errors
  .catch(err => console.error('Error on check:', err.message));
