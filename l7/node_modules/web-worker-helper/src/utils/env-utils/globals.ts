// Purpose: include this in your module to avoids adding dependencies on
// micro modules like 'global' and 'is-browser';

/* eslint-disable no-restricted-globals */
const globals = {
  self: typeof self !== 'undefined' && self,
  window: typeof window !== 'undefined' && window,
  document: typeof document !== 'undefined' && document,
};

const self_: { [key: string]: any } = globals.self || globals.window || {};
const window_: { [key: string]: any } = globals.window || globals.self || {};
const global_: { [key: string]: any } = globals.self || globals.window || {};
const document_: { [key: string]: any } = globals.document || {};

export { self_ as self, window_ as window, global_ as global, document_ as document };

/** true if running on a worker thread */
export const isWorker: boolean = typeof importScripts === 'function';

/** true if running on a mobile device */
export const isMobile: boolean = typeof window !== 'undefined' && typeof window.orientation !== 'undefined';
