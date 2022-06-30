const { SERVICE_PROVIDERS } = require('../src/modules/services');
const fs = require('fs');

const manifest = require('../package.json');

const OUTPUT_FILE = process.env.OUTPUT_FILE || './build/pluginConfig.json';

const pluginConfig = {
  supportedURLs: [],
  version: manifest.version
};

SERVICE_PROVIDERS.forEach(
  provider => {
    if (!provider.private) {
      pluginConfig.supportedURLs.push(provider.regex.source.replace(/\\/g, ''));
    }
  }
);

fs.writeFileSync(
  OUTPUT_FILE,
  JSON.stringify(pluginConfig)
);
