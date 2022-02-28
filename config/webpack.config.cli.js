const paths = require('./paths');

module.exports = {
  entry: paths.cliEntryPoint,
  mode: 'production',
  target: 'node',
  output: {
    filename: 'timing71.js',
    path: paths.cliBuild,
  },
};
