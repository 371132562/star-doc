# `async` 和 `await`
`async` 和 `await` 是用于简化处理异步代码的语法，使得异步代码看起来更像同步代码。
它们基于 `Promises`，可以更直观地管理异步任务，避免复杂的 `.then()` 和 `.catch()` 回调地狱。

## 语法
`async` 用于声明一个函数，该函数始终返回一个 Promise 对象。
```js
async function foo() {
  return 'Hello, World!';
}

console.log(foo()); // Promise {<fulfilled>: 'Hello, World!'}
```

在 `async` 函数体内允许使用 `await` 关键字，用于暂停 `async` 函数的执行，直到 `await` 后的 `Promise` 对象的状态变为 `fulfilled` 或 `rejected` 后，返回其结果并继续执行。
```js
async function fetchData() {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    console.log(data);
}

fetchData();
```
在上面的例子中，`fetchData` 函数会等待 `fetch` 请求返回结果后再继续执行，使函数体内部的代码 **看起来是同步执行的**，同时避免了回调地狱。

## 回调地狱
回调地狱是指多个异步操作嵌套在一起，当嵌套层级过深时，使得代码难以阅读和维护的现象。

### 使用 `Promise` 链式调用避免回调地狱
通过链式调用 `.then()` 方法来实现依次执行，但如果链过长，仍然不够直观。
```js
function fetchData1() {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Fetched Data 1');
            resolve('Data 1');
        }, 1000);
    });
}

function fetchData2(data1) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Fetched Data 2 with ' + data1);
            resolve('Data 2');
        }, 1000);
    });
}

function fetchData3(data2) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Fetched Data 3 with ' + data2);
            resolve('Data 3');
        }, 1000);
    });
}

fetchData1()
    .then(data1 => fetchData2(data1))
    .then(data2 => fetchData3(data2))
    .then(data3 => console.log('All data fetched:', data3))
    .catch(err => console.error(err));
```

### 使用 `async` 和 `await` 避免回调地狱
极大简化了基于 `Promise` 的代码逻辑，让异步操作看起来更像同步代码，使得代码结构更清晰，易于维护。
```js
function fetchData1() {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Fetched Data 1');
            resolve('Data 1');
        }, 1000);
    });
}

function fetchData2(data1) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Fetched Data 2 with ' + data1);
            resolve('Data 2');
        }, 1000);
    });
}

function fetchData3(data2) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Fetched Data 3 with ' + data2);
            resolve('Data 3');
        }, 1000);
    });
}

// 使用 async/await 简化 Promise 链
async function fetchAllData() {
    try {
        const data1 = await fetchData1();
        const data2 = await fetchData2(data1);
        const data3 = await fetchData3(data2);
        console.log('All data fetched:', data3);
    } catch (err) {
        console.error(err);
    }
}

fetchAllData();
```

## 执行顺序
`async` 函数内部代码的执行顺序在不同情况下会有细微的差别。

### 无 `await` 关键字时
当 `async` 函数内部没有 `await` 关键字时，它的行为基本上和普通函数没有区别，但仍然会返回一个 `Promise`。
该 `Promise` 对象的状态为 `fulfilled`，并且返回值为函数的返回值。
```js
async function example() {
    console.log('Inside async function');
}

console.log('Start');
example();
console.log('End');

// 输出:
// Start
// Inside async function
// End
```

### 有 `await` 关键字时
当 `async` 函数内部有 `await` 关键字时，有两种情况
- 如果后面是一个 `Promise` 对象时，`await` 会暂停等待该 `Promise` 解决，为异步执行
- 如果后面是一个非 `Promise` 值（如常量、非 Promise 对象）时，`await` 会立即返回该值，为同步执行

两种情况相同的地方在于，**函数的剩余部分会被加入微任务队列**，在当前同步代码执行完后执行。
```js
// Promise 对象
async function example() {
    console.log('Inside async function');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('After await');
}

console.log('Start');
example();
console.log('End');

// 输出:
// Start
// Inside async function
// End
// After await


// 常量
async function example() {
  console.log('Before await');
  await 42; // 非 Promise 值
  console.log('After await');
}

console.log('Start');
example();
console.log('End');

// 输出:
// Start
// Before await
// End
// After await
```

## 补充
从本质上看，`async/await` 与 `generator` 有很多相似之处。可以说 `async/await` 是对 `generator` 模式的进一步简化和封装，是一种语法糖。

在 `generator` 中通过 `yield` 暂停执行，返回一个迭代器对象，通过手动调用 `next()` 恢复执行。

而 `async/await` 通过 `await` 暂停执行，通过 `Promise` 对象的状态变化恢复执行。

`async/await` 本质上是封装了这种模式，以简化写法，并且自动执行 `next()`，使得代码更加简洁易读。
