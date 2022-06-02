import fs from 'fs';

export class Recorder {
  constructor(uuid) {
    this.uuid = uuid;
  }

  get outputDirectory() {
    return `./recordings/${this.uuid}`;
  }

  ensureDirectory() {
    if (!fs.existsSync(this.outputDirectory)) {
      fs.mkdirSync(this.outputDirectory, { recursive: true });
    }
  }

  addFrame(state) {
    const filename = `0${Math.floor(state.lastUpdated / 1000)}.json`;
    this._writeFile(filename, state);
  }

  writeManifest(manifest) {
    this._writeFile(
      'manifest.json',
      {
        ...manifest,
        version: 1
      }
    );
  }

  _writeFile(filename, data) {
    this.ensureDirectory();
    const output = `${this.outputDirectory}/${filename}`;

    fs.writeFileSync(
      output,
      JSON.stringify(data)
    );
  }
}
