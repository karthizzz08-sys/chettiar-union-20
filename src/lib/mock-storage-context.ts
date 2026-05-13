// Mock storage context for browser builds
// This replaces @tanstack/start-storage-context in production builds

export const createServerFn = (opts, fn) => {
  return fn;
};

export const createMiddleware = () => {
  return {
    server: (fn) => fn,
  };
};

export const getWebRequest = () => null;

export const getStartContext = () => ({});

export const startStorageContext = {
  getStore: () => ({}),
  run: (store, fn) => fn(),
};

export default {};
