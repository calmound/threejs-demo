/**
 * Worker 配置项
 */
export type WorkerOptions = {
  CDN?: string;
  worker?: boolean;
  maxConcurrency?: number;
  maxMobileConcurrency?: number;
  reuseWorkers?: boolean;
  _workerType?: string;
  [key: string]: any;
};

// Worker 任务上下文参数
export type WorkerContext = {
  process?: Process;
  processInBatches?: ProcessInBatches;
};

// Worker 任务处理函数
export type Process = (data: any, options?: Record<string, any>, context?: WorkerContext) => any;

// Worker 任务流处理函数
export type ProcessInBatches = (
  iterator: AsyncIterable<any> | Iterable<any>,
  options?: Record<string, any>,
  context?: WorkerContext
) => AsyncIterable<any>;

/**
 * worker 类型定义， worker 描述对象
 */
export type WorkerObject = {
  id: string;
  name: string;
  module: string;
  worker?: string | boolean;
  options: Record<string, any>;

  process?: Process;
  processInBatches?: ProcessInBatches;
};

/*
 * PROTOCOL
  Main thread                                worker
              => process-batches-start
              => process-batches-input-batch
              <= process-batches-output-batch
                ... // repeat
              => process-batches-input-done
              <= process-batches-result
                  // or
              <= process-batches-error
 */
export type WorkerMessageType =
  | 'process'
  | 'done'
  | 'error'
  | 'process-in-batches'
  | 'input-batch'
  | 'input-done'
  | 'output-batch';

export type WorkerMessagePayload = {
  id?: number;
  options?: Record<string, any>;
  input?: any; // Transferable;
  result?: any; // Transferable
  error?: string;
};

export type WorkerMessageData = {
  source: string;
  type: WorkerMessageType;
  payload: WorkerMessagePayload;
};

export type WorkerMessage = {
  type: string;
  data: WorkerMessageData;
};
