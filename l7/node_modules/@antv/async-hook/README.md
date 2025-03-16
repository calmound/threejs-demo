# `async-hook`

> L7 数据流管理工具

## Usage

```js
const asyncHook = require('async-hook');

```
## hooks

`async-hook` 提供了一系列的 `hook` 方法用于控制方法的调用
### SyncHook
SyncHook 支持对一组方法的顺序调用，同时 `call` 方法传入的参数会传递个方法组的每个方法使用
```js
const hook = new SyncHook();
const funcList = [
    (args) => {
        console.log(`step1 - ${args}`);
    },
    (args) =>{
        console.log(`step2 - ${args}`);
    },
    (args) =>{
        console.log(`step3 - ${args}`);
    },
];
hook.tap('test', funcList);
hook.call('call');
// step1 - call, step2 - call, step3 - call
```

### SyncBailHook
使用方法类似 SyncHook，但是不支持 `call` 传值

### SyncWaterfallHook
SyncWaterfallHook 支持对一组方法的顺序调用，正常情况下方法组会在执行 `call` 方法之后全部执行，但可以通过每个函数的返回值控制提前结束
```js
const hook = new SyncHook();
const funcList = [
    () => { // 执行第一个函数
        console.log('step1');
        return true;
    },
    () =>{ // 上一个函数返回值为 true，继续往下执行
        // do something
        console.log('step2');
        return false
    },
    () =>{ // 上一个函数返回值为 false（void、null、undefined、0），不再往下执行
        // do something
        console.log('step3');
        return true
    },
];
hook.tap('test', funcList);
hook.call('call');
// step1, step2
```
### AsyncSeriesHook
使用类似 SyncHook，不过方法组中都是异步方法

### AsyncSeriesBailHook
使用类似 AsyncSeriesHook，但是不支持 `call` 传值

### AsyncWaterfallHook
AsyncWaterfallHook 支持对一组异步方法的顺序调用，正常情况下方法组会在执行 `call` 方法之后全部执行，但可以通过每个函数的返回值控制提前结束
```js
const hook = new AsyncWaterfallHook();
const funcList = [
    () => { // 执行第一个函数
        console.log('step1');
        return new Promise((resolve) => setTimeout(() => resolve(true), 100))
    },
    async () =>{ // 上一个函数返回值为 true，继续往下执行
        // do something
        console.log('step2');
        return true
    },
    async () =>{ // 上一个函数返回值为 true，继续往下执行
        // do something
        console.log('step3');
        return false
    },
    async () =>{ // 上一个函数返回值为 false（void、null、undefined、0），不再往下执行
        // do something
        console.log('step4');
        return true
    },
];
hook.tapPromise('test', funcList);
hook.promise();
// step1, step2, step3
```
### AsyncParallelHook
控制一组异步方法的并行调用，类似 `Promise.all`
