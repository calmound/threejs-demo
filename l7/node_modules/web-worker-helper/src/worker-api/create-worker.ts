import type { WorkerMessageType, WorkerMessagePayload, WorkerContext, Process, ProcessInBatches } from '../types';
import AsyncQueue from '../async-queue/async-queue';
import WorkerBody from '../worker-farm/worker-body';

/** Counter for jobs */
let requestId = 0;
// 异步队列
let inputBatches: AsyncQueue<any>;
let options: Record<string, any>;

export type ProcessOnMainThread = (data: any, options?: Record<string, any>, context?: WorkerContext) => any;

/**
 * Set up a WebWorkerGlobalScope to talk with the main thread
 */
export function createWorker(process: Process, processInBatches?: ProcessInBatches): void {
  // 检查是否在 worker 线程中
  if (typeof self === 'undefined') {
    return;
  }

  const context: WorkerContext = {
    process: processOnMainThread,
  };

  WorkerBody.onmessage = async (type: WorkerMessageType, payload: WorkerMessagePayload) => {
    try {
      switch (type) {
        case 'process':
          if (!process) {
            throw new Error('Worker does not support atomic processing');
          }
          // eslint-disable-next-line no-case-declarations
          const result = await process(payload.input, payload.options || {}, context);
          WorkerBody.postMessage('done', { result });
          break;

        case 'process-in-batches':
          if (!processInBatches) {
            throw new Error('Worker does not support batched processing');
          }
          inputBatches = new AsyncQueue();
          options = payload.options || {};
          // eslint-disable-next-line no-case-declarations
          const resultIterator = processInBatches(inputBatches, options, context);
          for await (const batch of resultIterator) {
            WorkerBody.postMessage('output-batch', { result: batch });
          }
          WorkerBody.postMessage('done', {});
          break;

        case 'input-batch':
          inputBatches.push(payload.input);
          break;

        case 'input-done':
          inputBatches.close();
          break;

        default:
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      WorkerBody.postMessage('error', { error: message });
    }
  };
}

function processOnMainThread(arrayBuffer: ArrayBuffer, options = {}) {
  return new Promise((resolve, reject) => {
    const id = requestId++;

    /**
     */
    const onMessage = (type: string, payload: WorkerMessagePayload) => {
      if (payload.id !== id) {
        // not ours
        return;
      }

      switch (type) {
        case 'done':
          WorkerBody.removeEventListener(onMessage);
          resolve(payload.result);
          break;

        case 'error':
          WorkerBody.removeEventListener(onMessage);
          reject(payload.error);
          break;

        default:
        // ignore
      }
    };

    WorkerBody.addEventListener(onMessage);

    // Ask the main thread to decode data
    const payload = { id, input: arrayBuffer, options };
    WorkerBody.postMessage('process', payload);
  });
}
