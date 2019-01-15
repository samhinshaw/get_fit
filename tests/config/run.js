import Jasmine from 'jasmine';
import SpecReporter from 'jasmine-spec-reporter';

const jasmine = new Jasmine();

jasmine.loadConfigFile('tests/config/jasmine.json');

// remove default reporter logs
jasmine.getEnv().clearReporters();

// add jasmine-spec-reporter
jasmine.getEnv().addReporter(
  new SpecReporter({
    spec: {
      displayPending: true
    }
  })
);

jasmine.execute();
