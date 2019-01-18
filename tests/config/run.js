import Jasmine from 'jasmine';
import { SpecReporter } from 'jasmine-spec-reporter';

const jasmine = new Jasmine();

jasmine.loadConfigFile('tests/config/jasmine.json');

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

jasmine.execute();
