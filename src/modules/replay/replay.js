import { BlobReader, TextWriter, ZipReader } from "@zip.js/zip.js";
import { patch } from "../diffs";

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

    if (!this.manifest) {
      throw new Error('No manifest found!');
    }
    if (this.manifest.version !== 1) {
      throw new Error(`Manifest version ${this.manifest.version} unsupported (expecting version 1)`);
    }

    const firstFrame = Math.min(
      Math.min(...Object.keys(this._keyframes)),
      Math.min(...Object.keys(this._iframes))
    );

    const lastFrame = Math.max(
      Math.max(...Object.keys(this._keyframes)),
      Math.max(...Object.keys(this._iframes))
    );

    this.manifest.duration = lastFrame - firstFrame;
    this.manifest.startTime = firstFrame;
  }

  async readEntry(e) {
    const text = await e.getData(new TextWriter());
    return JSON.parse(text);
  }

  async getStateAt(time) {
    const closestKeyframe = Math.max(...Object.keys(this._keyframes).filter(k => (parseInt(k, 10) <= time)));

    const keyframeState = await this.readEntry(this._keyframes[closestKeyframe]);

    const iframes = Object.keys(this._iframes).filter(
      i => {
        const iVal = parseInt(i, 10);
        return iVal > closestKeyframe && iVal <= time;
      }
    );

    let myState = { ...keyframeState };

    for (let i = 0; i < iframes.length; i++) {
      const ifrState = await this.readEntry(this._iframes[iframes[i]]);
      myState = await applyIframe(myState, ifrState);
    }

    return myState;
  }

  async getStateAtRelative(relTime) {
    return await this.getStateAt(this.manifest.startTime + relTime);
  }

}

const applyIframe = (base, iframe) => {
  return new Promise(
    (resolve) => {
      const result = {
        cars: patch(iframe['cars'], base['cars']),
        session: patch(iframe['session'], base['session']),
        messages: iframe['messages'].concat(base['messages']).slice(0, 100),
        highlight: iframe['highlight'] || []
      };
      resolve(result);
    }
  );
};

export const createReplay = async (file) => {
  const reader = await new ZipReader(new BlobReader(file));
  const replay = new Replay(reader);
  await replay._init();
  return replay;
};
