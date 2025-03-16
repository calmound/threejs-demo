import type { WorkerObject, WorkerOptions } from '../types';
import { assert } from '../utils/env-utils/assert';

/**
 * Gets worker object's name (for debugging in Chrome thread inspector window)
 */
export function getWorkerName(worker: WorkerObject): string {
  return `${worker.name}`;
}

/**
 * Generate a worker URL based on worker object and options
 * @returns A URL to one of the following:
 * - a published worker on unpkg CDN
 * - a local test worker
 * - a URL provided by the user in options
 */
export function getWorkerURL(worker: WorkerObject, options: WorkerOptions = {}): string {
  const workerOptions = options[worker.id] || {};

  const workerFileName = `${worker.name}.worker.js`;

  let url = workerOptions.workerUrl;

  // If URL is test
  if (options._workerType === 'test') {
    url = `${worker.module}/dist/${workerFileName}`;
  }

  // If url override is not provided, generate a URL to published version on npm CDN unpkg.com
  if (!url) {
    url = `https://unpkg.com/${worker.module}/dist/${workerFileName}`;
  }

  assert(url);

  return url;
}
