import WorkerPool from './worker-pool';
import WorkerThread from './worker-thread';

export type WorkerFarmProps = {
  // max count of workers
  maxConcurrency?: number;
  maxMobileConcurrency?: number;
  reuseWorkers?: boolean;
  onDebug?: () => void;
};

const DEFAULT_PROPS: WorkerFarmProps = {
  maxConcurrency: 3,
  maxMobileConcurrency: 1,
  onDebug: () => {},
  reuseWorkers: true,
};

/**
 * Process multiple jobs with a "farm" of different workers in worker pools.
 */
export default class WorkerFarm {
  private props: WorkerFarmProps;
  private workerPools = new Map<string, WorkerPool>();
  // singleton
  private static workerFarm?: WorkerFarm;

  /** Check if Workers are supported */
  static isSupported(): boolean {
    return WorkerThread.isSupported();
  }

  /** Get the singleton instance of the global worker farm */
  static getWorkerFarm(props: WorkerFarmProps = {}): WorkerFarm {
    WorkerFarm.workerFarm = WorkerFarm.workerFarm || new WorkerFarm({});
    WorkerFarm.workerFarm.setProps(props);
    return WorkerFarm.workerFarm;
  }

  /** get global instance with WorkerFarm.getWorkerFarm() */
  constructor(props: WorkerFarmProps) {
    this.props = { ...DEFAULT_PROPS };
    this.setProps(props);
    this.workerPools = new Map();
  }

  /**
   * Terminate all workers in the farm
   * @note Can free up significant memory
   */
  public destroy(): void {
    for (const workerPool of this.workerPools.values()) {
      workerPool.destroy();
    }
  }

  /**
   * Set props used when initializing worker pools
   * @param props
   */
  public setProps(props: WorkerFarmProps): void {
    this.props = { ...this.props, ...props };
    // Update worker pool props
    for (const workerPool of this.workerPools.values()) {
      workerPool.setProps(this.getWorkerPoolProps());
    }
  }

  /**
   * Returns a worker pool for the specified worker
   * @param options - only used first time for a specific worker name
   * @param options.name - the name of the worker - used to identify worker pool
   * @param options.url -
   * @param options.source -
   * @example
   *   const job = WorkerFarm.getWorkerFarm().getWorkerPool({name, url}).startJob(...);
   */
  public getWorkerPool(options: { name: string; source?: string; url?: string }): WorkerPool {
    const { name, source, url } = options;
    let workerPool = this.workerPools.get(name);
    if (!workerPool) {
      workerPool = new WorkerPool({
        name,
        source,
        url,
      });
      workerPool.setProps(this.getWorkerPoolProps());
      this.workerPools.set(name, workerPool);
    }
    return workerPool;
  }

  private getWorkerPoolProps() {
    return {
      maxConcurrency: this.props.maxConcurrency,
      maxMobileConcurrency: this.props.maxMobileConcurrency,
      reuseWorkers: this.props.reuseWorkers,
      onDebug: this.props.onDebug,
    };
  }
}
