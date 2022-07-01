/* global globalThis */

import fs from 'fs';
import path from 'path';
import * as zip from "@zip.js/zip.js";
import { Blob } from "blob-polyfill";
import { REPLAY_FRAME_REGEX } from '@timing71/common';

globalThis.Blob = Blob;

zip.configure({ useWebWorkers: false });  // We're not in browser any more, Toto

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

const createIframe = (prevState, newState) => {
  return {};
};


export const finaliseRecording = async (recordingPath) => {
  if (!fs.existsSync(recordingPath)) {
    throw new Error(`Directory ${recordingPath} does not exist!`);
  }

  const manifestPath = path.join(recordingPath, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Directory ${recordingPath} does not contain a manifest.json - is this the correct path?`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath));
  const outputFilename = `${manifest.name} - ${manifest.description}.zip`;

  const blobWriter = new zip.BlobWriter("application/zip");
  const writer = new zip.ZipWriter(blobWriter);

  await writer.add(
    'manifest.json',
    new zip.TextReader(JSON.stringify(manifest))
  );

  const frames = fs.readdirSync(recordingPath).filter(f => REPLAY_FRAME_REGEX.test(f));

  frames.sort(
    (a, b) => parseInt(a, 10) - parseInt(b, 10)
  );

  let prevState = null;

  await Promise.all(
    frames.map(
      async (f, idx) => {
        const framePath = path.join(recordingPath, f);
        const frame = JSON.parse(fs.readFileSync(framePath));

        if (true || idx % 10 === 0) {
          // write a keyframe
          await writer.add(
            f,
            new zip.TextReader(JSON.stringify(frame))
          );
        }
        else {
          // TODO write an iframe
          const delta = createIframe(prevState, frame);
          const timestamp = f.substring(0, f.indexOf('.'));
          const filename = `${timestamp}i.json`;

          await writer.add(
            filename,
            new zip.TextReader(JSON.stringify(delta))
          );

        }

        prevState = frame;
      }
    )
  );

  await writer.close();
  const data = await blobWriter.getData().arrayBuffer();

  fs.writeFileSync(
    outputFilename,
    Buffer.from(data)
  );
};
