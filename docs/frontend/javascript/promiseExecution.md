# Promise的使用和执行过程
本质上 `Promise` 是由 `Promise()` 构造函数接收一个执行函数 `executor` 返回的对象。
它是一个状态机，是 JavaScript 异步编程的重要机制，它通过三种有限的状态和不可逆的状态转变来跟踪异步操作的结果，为开发者提供了清晰、可预测的异步控制流。

## Promise的基本结构

### 内部槽位
首先介绍下 `Promise` 的五个内部槽位，它们是 JavaScript 规范中的一种抽象概念，不能通过代码直接访问，是 ECMAScript 语言规范用来定义对象内部行为和状态的机制。
了解它们有助于理解 `Promise` 的内部机制。
- `[[PromiseState]]`：表示 `Promise` 的状态，可能是 `pending`（进行中）、`fulfilled`（已完成）或 `rejected`（已拒绝）。

- `[[PromiseResult]]`：表示 `Promise` 的结果，可能是 `undefined`、成功（`resolve`）的值或失败（`reject`）的原因。

- `[[PromiseFulfillReactions]]`：当 `Promise` 被成功 `resolve` 后，要触发的反应（即回调函数）。它是一个队列，存储着所有绑定到 `then` 方法的成功回调。

- `[[PromiseRejectReactions]]`：当 `Promise` 被 `reject` 时，要触发的反应（即回调函数）。它也是一个队列，存储着所有绑定到 `then` 方法或 `catch` 方法的失败回调。

- `[[PromiseIsHandled]]`：表示是否有处理程序绑定到这个 `Promise`（即是否有 `then` 或 `catch` 被调用）。如果没有处理程序，它能帮助检测未处理的拒绝情况，从而触发相应的警告。

### 基本语法
`Promise()` 构造函数接收一个执行函数 `executor` ，并生成一对相应的 `resolveFunc`（`resolve`） 和 `rejectFunc`（`reject`） 函数。

`executor` 是同步调用的（在构造 Promise 时立即调用），内部通常会封装某些提供基于回调的 API 的异步操作，其可以访问 `resolve` 和 `reject` 函数，用于改变 `Promise` 的状态。

- `resolve`：将 `Promise` 的状态改为 `fulfilled`，并将成功结果存储在 `[[PromiseResult]]` 中。
- `reject`：将 `Promise` 的状态改为 `rejected`，并将失败原因存储在 `[[PromiseResult]]` 中。
```javascript
let promise = new Promise((resolve, reject) => {
  // 执行异步操作
  if (成功) {
    resolve(成功值);
  } else {
    reject(失败原因);
  }
});
```

## Promise的三种状态
`Promise` 对象在其生命周期中只能从 `pending` 状态转变为其他状态，且状态一旦发生变化就不可逆。
- `pending`（进行中）：初始状态，异步操作尚未完成。
- `fulfilled`（已完成）：操作成功，`resolve` 被调用，`Promise` 变为完成状态，并返回一个值。
- `rejected`（已拒绝）：操作失败，`reject` 被调用，`Promise` 变为拒绝状态，并返回一个失败的原因。

## Promise的执行过程
### 初始化
`Promise` 对象被创建时，`Promise` 的状态会初始化为 `pending`，`executor` 函数立即被同步执行，并开始异步任务。
此时，Promise 对象的内部槽位如下：
- `[[PromiseState]]`: `pending`
- `[[PromiseResult]]`: `undefined`
- `[[PromiseFulfillReactions]]`: 空队列
- `[[PromiseRejectReactions]]`: 空队列

### 异步任务的执行
异步任务在后台执行，当任务完成或失败时，会调用 `resolve` 或 `reject` 函数。此时，`Promise` 内部状态和结果发生变化：
- 调用 `resolve`：状态转变为 `fulfilled`，`[[PromiseResult]]` 保存成功的值。
- 调用 `reject`：状态转变为 `rejected`，`[[PromiseResult]]` 保存失败的原因。

### 回调的注册
当你通过 `then` 和 `catch` 绑定成功或失败的回调时，`Promise` 会将这些回调存储在相应的队列中
`then(onFulfilled, onRejected)`
- `onFulfilled` 被添加到 `[[PromiseFulfillReactions]]` 队列中
- `onRejected` 被添加到 `[[PromiseRejectReactions]]` 队列中
`catch(onRejected)`
- `onRejected` 被添加到 `[[PromiseRejectReactions]]` 队列中
> [!NOTE]
> `then` 方法的第二个参数是可以处理 `reject` 的回调的，等价于 `catch` 方法。常见的情况是使用 `catch` 来处理 `reject`，将 `then` 的 `onRejected` 参数省略，
> 这相当于将默认的空处理函数 `undefined` 放入 `[[PromiseRejectReactions]]` 中，所以这个函数什么也不会做。

### 回调的异步执行
`Promise` 的回调执行遵循微任务队列机制。即使 `resolve` 或 `reject` 被立即调用，回调函数也不会同步执行，而是会被放入微任务队列，在 [`Call Stack`](./eventLoop) 被清空后执行。
```js
let promise = new Promise((resolve, reject) => {
  console.log('Promise开始');
  resolve('成功');
});

promise.then((value) => {
  console.log('成功的回调：', value);
});

console.log('Promise结束');

// Promise开始
// Promise结束
// 成功的回调：成功
```
可以看到，then 中的回调是异步执行的，即使 resolve 被立即调用。
> [!NOTE]
> 如果回调注册时 `Promise` 还处于 `pending` 状态，这些回调函数会被暂时存储，等到状态改变时再执行。
> 
> 如果状态已经是 `fulfilled`，所有在 `[[PromiseFulfillReactions]]` 中的回调都会被依次执行。
>
> 如果状态已经是 `rejected`，所有在 `[[PromiseRejectReactions]]` 中的回调都会被依次执行。

### `finally`的执行
`finally` 是用于无论 `Promise` 的结果是 `fulfilled` 还是 `rejected`，都执行一些操作的回调。
与 `then` 和 `catch` 不同，`finally` 不接受参数，它只是简单地执行，并且不会改变 `Promise` 的结果。
```js
let promise = new Promise((resolve, reject) => {
  resolve('成功');
});

promise
  .then((value) => console.log('成功:', value))
  .finally(() => console.log('执行完成'));

// 成功: 成功
// 执行完成
```

## Promise的链式调用
连续执行多个异步操作是一种常见的情况。当下一个异步操作依赖于上一个异步操作的结果时，在旧的回调风格中，这种操作会导致经典的回调地狱。
```js
doSomething(function (result) {
  doSomethingElse(result, function (newResult) {
    doThirdThing(newResult, function (finalResult) {
      console.log(`得到最终结果：${finalResult}`);
    }, failureCallback);
  }, failureCallback);
}, failureCallback);
```
有了 `Promise`，我们就可以通过一个 `Promise` 链来解决这个问题。这就是 `Promise API` 的优势，因为回调函数是附加到返回的 `Promise` 对象上的，而不是作为参数传入一个函数中。
```js
doSomething()
  .then(result => doSomethingElse(result))
  .then(newResult => doThirdThing(newResult))
  .then(finalResult => {
    console.log(`得到最终结果：${finalResult}`);
  })
  .catch(failureCallback);
```
`then()`函数会返回一个和原来不同的新的 `Promise`，并且这个新的 `Promise` 的状态取决于 `then` 方法中回调函数的执行结果。
- 如果当前 `then` 回调函数返回一个值，则相当于 `resolve()` ，新的 `Promise` 的状态会变为 `fulfilled`，并且值会传递给 **下一个** `then` 。
   > [!NOTE]
   > ```js
   > let promise = new Promise((resolve, reject) => {
   >   resolve(1);
   > });
   >
   > promise
   >   .then((value) => {
   >     console.log(value); // 输出: 1
   >     return value * 2; // 返回普通值，相当于 resolve(value * 2)
   >   })
   >   .then((value) => {
   >     console.log(value); // 输出: 2
   >   });
   > ```
- 如果当前 `then` 回调函数抛出一个异常，则相当于 `reject()`，新的 `Promise` 的状态会变为 `rejected`，并且异常会传递给 **下一个** `catch` 或 `then` 的第二个参数错误回调。
   > [!NOTE]
   > ```js
   > let promise = new Promise((resolve, reject) => {
   >   resolve(1);
   > });
   >
   > promise
   >  .then((value) => {
   >    console.log(value); // 输出: 1
   >    // 返回一个 Promise，相当于将这个 Promise 的结果传递给下一个 then
   >    return new Promise((resolve, reject) => {
   >       setTimeout(() => resolve(value * 2), 1000); // 成功后传递 2
   >    });
   > })
   > .then((value) => {
   >    console.log(value); // 输出: 2
   > });
   > ```
- 如果当前 `then` 回调函数返回一个 `Promise`，则新的 `Promise` 会等待这个 `Promise` 的状态改变，根据其状态决定 **下一个** 回调的执行。
   > [!NOTE]
   > ```js
   > let promise = new Promise((resolve, reject) => {
   >   resolve(1);
   > });
   >
   > promise
   >  .then((value) => {
   >     console.log(value); // 输出: 1
   >     throw new Error('出现错误'); // 抛出错误，相当于 reject('出现错误')
   >  })
   >  .then((value) => {
   >     console.log(value); // 不会被执行
   >  })
   >  .catch((error) => {
   >     console.error('捕获到的错误:', error); // 输出: 捕获到的错误: Error: 出现错误
   >   });
   > ```
- 如果没有返回任何值，则等同于 `resolve(undefined)`。

## Promise的错误处理
Promise 的错误处理机制非常灵活，所有的异常（包括同步代码中的异常）都可以通过 `catch` 方法捕获。
如果在 `then` 中发生错误，无论是显式抛出 `throw` 还是代码执行中出现的异常，也可以传递到下一个 `catch` 进行处理。
```js
let promise = new Promise((resolve, reject) => {
  throw new Error('出现错误');
});

promise
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.error('捕获到的错误：', error);
  });
```

## Promise的静态方法
`Promise` 除了实例方法外，还有一些静态方法，用于处理多个 `Promise` 实例的状态。
- `Promise.all(iterable)`：接收一个可迭代对象，返回一个新的 `Promise`。
只有当所有 `Promise` 都变为 `fulfilled` 时，新的 `Promise` 才会变为 `fulfilled`，并返回所有 `Promise` 的结果数组。
如果有一个 `Promise` 变为 `rejected`，新的 `Promise` 就会变为 `rejected`，并返回第一个 `rejected` 的结果。

- `Promise.race(iterable)`：接收一个可迭代对象，返回一个新的 `Promise`。返回第一个 `Promise` 的结果，无论是 `fulfilled` 还是 `rejected`。

- `Promise.any(iterable)`：接收一个可迭代对象，返回一个新的 `Promise`。
只要有一个 `Promise` 变为 `fulfilled`，新的 `Promise` 就会变为 `fulfilled`，并返回第一个 `fulfilled` 的结果。
如果所有 `Promise` 都变为 `rejected`，新的 `Promise` 就会变为 `rejected`，并返回一个 `AggregateError` 对象，包含所有 `rejected` 的原因。

- `Promise.allSettled(iterable)`：接收一个可迭代对象，返回一个新的 `Promise`。
  当所有 `Promise` 都变为 `fulfilled` 或 `rejected` 时，新的 `Promise` 才会变为 `fulfilled`，并返回所有 `Promise` 的结果数组，包括每个 `Promise` 的状态。

### 总结
| **方法**           | **成功时返回**                                        | **失败时返回**                                        | **特点**                                                                                           |
|--------------------|------------------------------------------------------|------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| **`Promise.all`**   | 所有 `Promise` 成功时，返回**所有结果数组**              | 任意一个 `Promise` 失败时，返回**第一个失败的原因**         | - 并行执行所有 `Promise`，所有都成功才会 `resolve`。<br> - 任意一个失败则立即 `reject`。        |
| **`Promise.race`**  | **第一个完成的 `Promise` 结果**（无论成功或失败）       | **第一个完成的 `Promise` 结果**（无论成功或失败）       | - 并行执行所有 `Promise`，第一个 `resolve` 或 `reject` 就停止。                                 |
| **`Promise.any`**   | **第一个成功的 `Promise` 结果**                        | 所有 `Promise` 失败时，返回一个**`AggregateError`**    | - 并行执行所有 `Promise`，只要有一个成功就 `resolve`。<br> - 所有失败时才 `reject`。             |
| **`Promise.allSettled`** | 返回所有 `Promise` 的**结果数组**（每个结果包含 `status` 和 `value/reason`） | 返回所有 `Promise` 的**结果数组**（每个结果包含 `status` 和 `value/reason`） | - 并行执行所有 `Promise`，无论成功或失败都返回结果。<br> - 不会因为任何 `Promise` 失败而终止。   |

## Promise的优势
- **链式调用，避免回调地狱**
- **更好的错误处理**

   在回调方式中，错误处理通常需要在每个回调中手动添加 try-catch 或在每个函数中处理错误。
   `Promise` 提供了一个统一的错误处理机制，通过 `catch` 方法捕获链中的所有错误，无论在哪个步骤发生的错误都会被传递到下一个 `catch` 回调。
- **处理并行异步任务**

   `Promise` 提供了 `Promise.all` 和 `Promise.race` 等静态方法，可以方便地处理并行异步操作。
