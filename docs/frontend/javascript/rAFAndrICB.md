在阅读本篇之前，建议先阅读 [浏览器帧原理](../browser/browserFrame) 来了解这两个 API 的运行时机。

这两个 API 都与浏览器的帧渲染相关，是良好的执行周期性任务的选择，但它们并不属于事件循环的宏任务或微任务。
`requestAnimationFrame` 适用于需要与帧渲染周期同步的任务，而 `requestIdleCallback` 适合在浏览器空闲时间执行低优先级任务。

## requestAnimationFrame 
### 基本使用
`requestAnimationFrame` 提供了一种让 JavaScript 代码与浏览器渲染周期同步的方式，**通常用于动画**。
在浏览器的每一帧渲染之前，允许开发者注册一个回调函数，这个回调会在下一帧绘制前调用。

```js
let requestId;

function animate() {
  // 执行动画任务
  console.log("动画帧更新");

  // requestAnimationFrame是一次性的，所以你必须递归调用自身来实现动画循环，它会在下一帧绘制前调用
  requestId = requestAnimationFrame(animate);
}

// 开始动画
requestId = requestAnimationFrame(animate);

// 假设在某个时刻需要取消动画
cancelAnimationFrame(requestId);

```
### 与定时器的区别
`requestAnimationFrame`并不是按照固定的时间间隔调用回调函数，它是由系统来决定回调函数的执行时机的，会在帧流程中，事件循环执行之后，下一次重新渲染之前执行回调函数。
通常会跟随屏幕的刷新率，来保证动画的流畅性。

但要注意的是，每帧的预算只有约 16ms（60Hz前提下），如果回调函数占用太多时间，可能会导致丢帧，造成动画卡顿。

### 多个回调
当你同时注册了多个回调函数时，浏览器会**按照注册的顺序依次调用**这些回调函数。

回调函数会接受一个参数 `DOMHighResTimeStamp`，用于表示上一帧渲染的结束时间，单位为毫秒。
多个回调开始在同一帧中触发时，它们都会收到相同的时间戳。

## requestIdleCallback
### 基本使用
`requestIdleCallback` 是一种让开发者可以在浏览器空闲时执行低优先级任务的 API。浏览器会在有空闲时间时（即一帧结束后到下一帧开始前的空闲时间）调用提供的回调函数。

它适用于那些不影响用户体验、且可以推迟执行的任务，比如**日志**、**分析数据的收集**操作等。

该 API 的第一个参数 `callback` 会被传入一个名为 [`IdleDeadline`](https://developer.mozilla.org/zh-CN/docs/Web/API/IdleDeadline) 的参数，
这个参数可以获取当前空闲时间以及回调是否在超时时间前已经执行的状态。
```js
let idleCallbackId;

function idleTask(deadline) {
    console.log("执行空闲任务");
    // 在空闲时间执行低优先级任务
    while (deadline.timeRemaining() > 0) {
        // 执行任务
    }
}

// 注册空闲任务回调
idleCallbackId = requestIdleCallback(idleTask);

// 在需要时取消该回调，只有尚未执行的回调可以被取消。
cancelIdleCallback(idleCallbackId);
```

### 假如浏览器没有空闲时间
假如浏览器一直处于非常忙碌的状态，`requestIdleCallback` 注册的任务有可能永远不会执行。这时就可能需要用到第二个参数。

第二个参数是一个配置对象，可以设置 `timeout` 属性，用于指定最长等待时间，如果在这个时间内没有空闲时间，回调函数会被强制执行，以确保任务不会无限期延迟。
```js
function reportAnalytics(deadline) {
  // 如果有剩余时间则执行
  while (deadline.timeRemaining() > 0) {
    console.log("发送分析数据");
  }

  // 如果没有足够的空闲时间，可以在下一个空闲时间继续执行
  if (deadline.timeRemaining() <= 0) {
    console.log("没有空闲时间，任务推迟到下一空闲时间段");
    requestIdleCallback(reportAnalytics, { timeout: 3000 });
  }
}

// 注册回调，但设置了超时 3000 毫秒
requestIdleCallback(reportAnalytics, { timeout: 3000 });
```

### 多个回调
当你同时注册了多个回调函数时，浏览器会**按照注册的顺序依次调用**这些回调函数。

如果当前帧没有足够的空闲时间来执行所有任务，浏览器会优先执行部分任务，剩下的任务会推迟到下一帧的空闲时间内执行，任务不会被丢弃。
