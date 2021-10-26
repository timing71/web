const { SERVICE_PROVIDERS } = require('../src/modules/services');
const fs = require('fs');

const OUTPUT_FILE = './build/pluginConfig.json';

const pluginConfig = {
  supportedURLs: []
};

SERVICE_PROVIDERS.forEach(
  provider => {
    pluginConfig.supportedURLs.push(provider.regex.source.replaceAll('\\', ''));
  }
);

fs.writeFileSync(
  OUTPUT_FILE,
  JSON.stringify(pluginConfig)
);
