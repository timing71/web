import { BlobReader, TextWriter, ZipReader } from "@zip.js/zip.js";

const FRAME_REGEX = /^([0-9]{5,11})(i?).json$/;

class Replay {
  constructor(zipFile) {
    this._file = zipFile;
    this._keyframes = {};
    this._iframes = {};
  }

  async _init() {
    const entries = await this._file.getEntries();

    await Promise.all(
      entries.map(
        async entry => {
          const frameMatch = entry.filename.match(FRAME_REGEX);
          if (frameMatch) {
            const isIFrame = !!frameMatch[2];
            const timestamp = parseInt(frameMatch[1], 10);

            if (isIFrame) {
              this._iframes[timestamp] = entry;
            }
            else {
              this._keyframes[timestamp] = entry;
            }
            return Promise.resolve();
          }
          else if (entry.filename === 'manifest.json') {
            this.manifest = await this.readEntry(entry);
          }
        }
      )
    );

    console.log("init done", this)
  }

  async readEntry(e) {
    const text = await e.getData(new TextWriter());
    return JSON.parse(text);
  }

}

export const createReplay = async (file) => {
  const reader = await new ZipReader(new BlobReader(file));
  const replay = new Replay(reader);
  await replay._init();
  return replay;
};
