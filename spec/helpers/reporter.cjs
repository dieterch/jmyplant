// spec/helpers/reporter.js (or another setup file)

const ConsoleReporter = require('jasmine-console-reporter');

// Create a new instance of the reporter with custom settings
const reporter = new ConsoleReporter({
  colors: true,           // Enable color output
  cleanStack: true,       // Simplify stack traces
  verbosity: 4,           // Maximum verbosity level
  listStyle: 'indent',    // Indent test names for readability
  activity: false,        // Disable activity spinner
  timeUnit: 'ms',         // Display test duration in milliseconds
  timeThreshold: { ok: 500, warn: 1000, ouch: 3000 }, // Highlight slow tests
});

// Clear default Jasmine reporters and add the console reporter
jasmine.getEnv().clearReporters();
jasmine.getEnv().addReporter(reporter);
