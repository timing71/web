const TIME_FACTOR = 10957 * 24 * 60 * 60 * 1000; // Don't ask, no idea

export const serverToRealTime = (serverTime) => (((serverTime / 1000) + TIME_FACTOR) / 1000);

export const realToServerTime = (realTime) => (realTime * 1000 - TIME_FACTOR) * 1000;
