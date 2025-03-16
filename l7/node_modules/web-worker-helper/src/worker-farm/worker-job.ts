import type { WorkerMessageType, WorkerMessagePayload } from '../types';
import WorkerThread from './worker-thread';
import { assert } from '../utils/env-utils/assert';

/**
 * Represents one Job handled by a WorkerPool or WorkerFarm
 */
export default class WorkerJob {
  public readonly name: string;
  public readonly workerThread: WorkerThread;
  public isRunning: boolean;
  /** Promise that resolves when Job is done */
  public readonly result: Promise<any>;

  private resolve: (value: any) => void;
  private reject: (reason?: any) => void;

  constructor(jobName: string, workerThread: WorkerThread) {
    this.name = jobName;
    this.workerThread = workerThread;
    this.isRunning = true;
    this.resolve = () => {};
    this.reject = () => {};
    this.result = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  /**
   * Send a message to the job's worker thread
   * @param data any data structure, ideally consisting mostly of transferrable objects
   */
  public postMessage(type: WorkerMessageType, payload: WorkerMessagePayload): void {
    this.workerThread.postMessage({
      source: 'Main thread', // Lets worker ignore unrelated messages
      type,
      payload,
    });
  }

  /**
   * Call to resolve the `result` Promise with the supplied value
   */
  public done(value: any): void {
    assert(this.isRunning, 'WorkerJob isRunning false.');
    this.isRunning = false;
    this.resolve(value);
  }

  /**
   * Call to reject the `result` Promise with the supplied error
   */
  public error(error: Error): void {
    assert(this.isRunning, 'WorkerJob isRunning false.');
    this.isRunning = false;
    this.reject(error);
  }
}
