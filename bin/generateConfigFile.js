import { TransformStream } from 'web-streams-polyfill/dist/ponyfill.es2018.mjs';
import fs from 'fs';

// @zip.js/zip.js needs TransformStream to be available
// Needs to happen before import of SERVICE_PROVIDERS
global.TransformStream = TransformStream;

const packageJson = fs.readFileSync('package.json');
const manifest = JSON.parse(packageJson);

const commonJson = fs.readFileSync('node_modules/@timing71/common/package.json');
const commonManifest = JSON.parse(commonJson);

const servicesJson = fs.readFileSync('node_modules/@timing71/services/package.json') || '{}';
const servicesManifest = JSON.parse(servicesJson);

const OUTPUT_FILE = process.env.OUTPUT_FILE || './build/pluginConfig.json';

const pluginConfig = {
  supportedURLs: [],
  version: manifest.version,
  versions: {
    common: commonManifest.version,
    services: servicesManifest.version,
    web: manifest.version
  }
};

import('@timing71/services').finally(
  import('@timing71/common').then(
    ({ SERVICE_PROVIDERS }) => {
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
    }
  )
);
