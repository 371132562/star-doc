# 事件循环
JavaScript 是一种单线程语言，这意味着同一时间只能执行一个任务。
事件循环（Event Loop）是 JavaScript 处理异步任务的重要机制，它负责协调代码的执行顺序，确保异步操作在非阻塞的情况下正确完成。

## 基本概念
![事件循环机制示意图](/images/event-loop.png)
事件循环机制包含上图中的几个重要概念
- [**调用栈（Call Stack）**](./jsExecutionFlow#call-stack)：用于存储执行上下文的栈结构，遵循 **LIFO（后进先出）** 的原则。

- **事件循环（Event Loop）**：负责协调代码的执行顺序，事件循环不断检查调用栈是否为空。如果为空，事件循环会从任务队列（或微任务队列）中取出下一个回调任务，并将其放入调用栈执行。

- **任务队列（Task Queue）**：或将其称为宏任务队列（Macrotask Queue）。用于存放异步任务产生的回调。以下Web API会产生对应的任务
   - `setTimeout`
   - `setInterval`
   - `setImmediate`（仅在 Node.js 中） 
   - I/O 操作
   - UI 渲染等

- **微任务队列（Microtask Queue）**：用于存放异步微任务产生的回调，微任务的执行优先级高于任务（在微任务队列清空之前不会执行任务队列中的任务）。以下Web API会产生对应的任务
   - `Promise` 的 `then` 、 `catch` 和 `finally` 回调
   - `MutationObserver` 回调（仅浏览器）
   - `process.nextTick`（仅Node）

- **Web APIs**：是浏览器提供的一组用于执行异步操作的接口，例如 `setTimeout`、`fetch`、`XMLHttpRequest`、`Geolocation API` 等。
调用这些方法是同步的，即调用时会立即创建执行上下文并压入调用栈，
但这些 API 的异步操作（如 `setTimeout` 的计时、`fetch` 的网络请求、`Geolocation API` 的等待用户操作等）由浏览器负责执行。
异步任务的执行与调用栈、任务队列、微任务队列无关，只有当这些异步操作完成后，浏览器才会将对应注册的回调函数放入任务队列或微任务队列中，以便在主线程空闲时执行。

## 工作流程
### 一般流程
当 JavaScript 引擎执行代码时，同步任务的代码会被按顺序创建执行上下文压入调用栈中执行，遇到调用 Web API 的异步操作时，
会将其放入 Web API 中等待异步任务完成（只有当异步任务完成，才会将其注册的回调加入任务队列或微任务队列），同时继续执行后续代码。

调用栈清空后，事件循环会检查任务队列和微任务队列，并将其中的任务压入调用栈执行。
如果微任务队列不为空，会依次执行微任务队列中的任务，直到微任务队列为空，再执行任务队列中的任务。
```js
console.log('Start');

setTimeout(() => {
  console.log('Macro Task');
}, 0);

Promise.resolve().then(() => {
  console.log('Micro Task 1');
}).then(() => {
  console.log('Micro Task 2');
});

console.log('End');

// 输出结果
// Start
// End
// Micro Task 1
// Micro Task 2
// Macro Task
```

### 异步任务嵌套异步任务
如果在执行任务（微任务）队列中的任务时其注册了新的异步任务，同样按照上述事件循环对于调用栈和任务（微任务）队列检查策略进行执行。
```js
setTimeout(() => {
  console.log('Macro Task 1');
  
  Promise.resolve().then(() => {
    console.log('Micro Task within Macro Task');
  });
  
}, 0);

Promise.resolve().then(() => {
  console.log('Micro Task 1');
});

Promise.resolve().then(() => {
  console.log('Micro Task 2');
});

// 输出结果
// Micro Task 1
// Micro Task 2
// Macro Task 1
// Micro Task within Macro Task
```
> [!WARNING]
> 如果在微任务队列中不断注册新的微任务，导致微任务队列永远不会清空，从而阻止任务队列的执行。
> ```js
> function recursiveMicroTask() {
>    Promise.resolve().then(() => {
>       console.log('New Micro Task');
>       recursiveMicroTask();  // 再次注册微任务
>    });
> }
>
> recursiveMicroTask();
> setTimeout(() => {
>    console.log('This will never be executed'); // 永远不会执行
> }, 0);
> ```
> 在这个例子中，由于 `Promise.resolve()` 直接返回了已完成（`fulfilled`）状态的 `Promise`。这个操作是同步的，没有任何异步任务需要等待。
> 等同于调用 `queueMicrotask()` 将任务直接加入微任务队列，没有引入任何额外的异步延迟。
> 
> 导致 `recursiveMicroTask` 在当前调用栈清空之前不断注册新的微任务，使得微任务队列永远不会清空，从而阻止任务队列的执行。

### 调用栈中的长耗时任务
如果调用栈中的任务耗时过长，会阻塞事件循环，导致任务队列中的任务无法及时执行。这是因为只有当调用栈清空后，事件循环才能开始处理任务队列中的异步任务。
```js
console.log('Start');

setTimeout(() => {
  console.log('Async Task');
}, 0);

// 模拟一个长耗时任务
const start = Date.now();
while (Date.now() - start < 5000) {
  // 模拟同步阻塞
}

console.log('End');

// 输出结果
// Start
// End
// Async Task

// 注意：这里的 'Async Task' 并不会立即输出，而是在 'End' 输出后 5s 后输出 // [!code highlight]
```
在这个例子中，`while` 循环会阻塞调用栈，`setTimeout` 的回调并没有遵从代码设置的 `0s` 延迟，而是在 `5s` 后执行。
