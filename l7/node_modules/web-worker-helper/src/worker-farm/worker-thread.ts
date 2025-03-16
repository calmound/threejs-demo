import { assert } from '../utils/env-utils/assert';
import { getLoadableWorkerURL } from '../utils/worker-utils/get-loadable-worker-url';
import { getTransferList } from '../utils/worker-utils/get-transfer-list';

const NOOP = () => {};

export type WorkerThreadProps = {
  name: string;
  source?: string;
  url?: string;
};

/**
 * Represents one worker thread
 */
export default class WorkerThread {
  public readonly name: string;
  public readonly source: string | undefined;
  public readonly url: string | undefined;
  public terminated = false;
  public worker: Worker;
  public onMessage: (message: any) => void;
  public onError: (error: Error) => void;

  private loadableURL = '';

  constructor(props: WorkerThreadProps) {
    const { name, source, url } = props;
    assert(source || url); // Either source or url must be defined
    this.name = name;
    this.source = source;
    this.url = url;
    this.onMessage = NOOP;
    this.onError = (error) => console.log(error);

    this.worker = this.createBrowserWorker();
  }

  static isSupported(): boolean {
    return typeof Worker !== 'undefined';
  }

  /**
   * Terminate this worker thread
   * @note Can free up significant memory
   */
  public destroy(): void {
    this.onMessage = NOOP;
    this.onError = NOOP;
    this.worker.terminate();
    this.terminated = true;
  }

  public get isRunning() {
    // TODO: isRunning
    return Boolean(this.onMessage);
  }

  /**
   * Send a message to this worker thread
   * @param data any data structure, ideally consisting mostly of transferrable objects
   * @param transferList If not supplied, calculated automatically by traversing data
   */
  public postMessage(data: any, transferList?: any[]): void {
    transferList = transferList || getTransferList(data);
    this.worker.postMessage(data, transferList);
  }

  /**
   * Generate a standard Error from an ErrorEvent
   * @param {ErrorEvent} event
   */
  private getErrorFromErrorEvent(event: ErrorEvent): Error {
    // Note Error object does not have the expected fields if loading failed completely
    // https://developer.mozilla.org/en-US/docs/Web/API/Worker#Event_handlers
    // https://developer.mozilla.org/en-US/docs/Web/API/ErrorEvent
    let message = 'Failed to load ';
    message += `worker ${this.name} from ${this.url}. `;
    if (event.message) {
      message += `${event.message} in `;
    }
    // const hasFilename = event.filename && !event.filename.startsWith('blob:');
    // message += hasFilename ? event.filename : this.source.slice(0, 100);
    if (event.lineno) {
      message += `:${event.lineno}:${event.colno}`;
    }
    return new Error(message);
  }

  /**
   * Creates a worker thread on the browser
   */
  private createBrowserWorker() {
    this.loadableURL = getLoadableWorkerURL({ source: this.source, url: this.url });
    const worker = new Worker(this.loadableURL, { name: this.name });

    worker.onmessage = (event) => {
      if (!event.data) {
        this.onError(new Error('No data received'));
      } else {
        this.onMessage(event.data);
      }
    };

    // This callback represents an uncaught exception in the worker thread
    worker.onerror = (error) => {
      this.onError(this.getErrorFromErrorEvent(error));
      this.terminated = true;
    };

    worker.onmessageerror = (event) => console.error(`worker ${this.name}, message error: ${event}`);

    return worker;
  }
}
