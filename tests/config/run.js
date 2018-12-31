import Jasmine from 'jasmine';

const jasmine = new Jasmine();
jasmine.loadConfigFile('tests/config/jasmine.json');
jasmine.execute();
