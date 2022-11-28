import { TransformStream } from 'web-streams-polyfill/dist/ponyfill.es2018.mjs';
import fs from 'fs';

// @zip.js/zip.js needs TransformStream to be available
// Needs to happen before import of SERVICE_PROVIDERS
global.TransformStream = TransformStream;

import('@timing71/services').then(
  ({ SERVICE_PROVIDERS }) => {
    const packageJson = fs.readFileSync('package.json');
    const manifest = JSON.parse(packageJson);

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
  }
);
