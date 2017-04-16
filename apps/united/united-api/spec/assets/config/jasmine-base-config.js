
'use strict';

require('reflect-metadata');
require('../../../winston.config');

let reporters = require('jasmine-reporters');
let fs = require('fs');

// Add reporters

// JUnit reporter
let junitReporter = new reporters.JUnitXmlReporter({
	savePath: 'target/junit/',
	consolidateAll: true
});
jasmine.getEnv().addReporter(junitReporter);
