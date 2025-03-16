export type TaskID = number;
type Task = {
    callback: (timeStamp: number) => void;
    id: TaskID;
    cancelled: boolean;
};
export declare class TaskQueue {
    _queue: Array<Task>;
    _id: TaskID;
    _cleared: boolean;
    _currentlyRunning: Array<Task> | false;
    constructor();
    add(callback: (timeStamp: number) => void): TaskID;
    remove(id: TaskID): void;
    run(timeStamp?: number): void;
    clear(): void;
}
export {};
