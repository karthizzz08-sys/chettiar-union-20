// Mock crypto module for browser builds
// This replaces Node.js crypto in production builds

export const createHash = (algorithm) => {
  return {
    update: () => ({
      digest: () => "",
    }),
  };
};

export const randomInt = (min, max) => {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const randomBytes = (size) => {
  const arr = new Uint8Array(size);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  }
  return arr;
};

export default {
  createHash,
  randomInt,
  randomBytes,
};
