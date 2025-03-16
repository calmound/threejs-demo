# web-worker-helper

> Forked from [@loaders.gl/worker-utils](https://github.com/visgl/loaders.gl/blob/master/modules/worker-utils/README.md) implementation

## Time consuming task

```ts
// fibonacci.js
export function fibonacci(n: number) {
  let n1 = 1,
    n2 = 1,
    sum = 1;
  for (let i = 3; i <= n; i += 1) {
    sum = n1 + n2;
    n1 = n2;
    n2 = sum;
  }
  return sum;
}
```

## Creating workers for time-consuming task

```ts
// fibonacci.worker.js
import { createWorker } from 'web-worker-helper';
import { fibonacci } from './fibonacci';

createWorker(async (data: number) => {
  const result = fibonacci(data);
  return result;
});
```

## Bundle worker

## Main thread call worker

1. parse worker

```ts
import { WorkerFarm } from 'web-worker-helper';

export async function parseWorker(
  workerName: string,
  data: any,
  options?: Record<string, any> = { maxConcurrency: 3, reuseWorkers: true }
) {
  const url = getWorkerURL({ name: workerName });
  // const source = `fibonacci codeString`
  const workerFarm = WorkerFarm.getWorkerFarm({
    maxConcurrency: options.maxConcurrency,
    reuseWorkers: options.reuseWorkers,
  });
  const workerPool = workerFarm.getWorkerPool({ name: workerName, url });
  // const workerPool = workerFarm.getWorkerPool({ name: workerName, source });
  const job = await workerPool.startJob(workerName, (job, type, data) => job.done(data));

  job.postMessage('process', { input: data });

  const result = await job.result;
  return result.result;
}
```

2. Call time-consuming task

```ts
import { parseWorker } from './parse-worker';
import { fibonacci } from './fibonacci';

export async function starFibonacci(iskorker, data) {
  if (iskorker) {
    const result = await parseWorker('fibonacci-worker', data, {});
    return result;
  }

  const result = await fibonacci(data);
  return result;
}
```
