# 闭包
闭包由两部分组成，一个函数和一个创建该函数的执行上下文。
这个函数会 **记住** 它被创建时上下文环境中的作用域链和变量对象，**有权且仅它有权** 访问环境中的局部变量，即使这个函数之后在其他的上下文环境中被调用。

这种组合形成了一种私有作用域机制，创建该函数的上下文环境中的作用域链和变量对象即使已经执行完毕但也不会被销毁，形成了一个闭包。
::: info NOTE
执行上下文包括了**变量对象**、**作用域链**、**`this` 指向**。
:::

## 核心概念
推荐先行了解 [执行上下文和作用域](./jsExecutionFlow) 相关概念。

### 作用域
Javascript 采用词法作用域，在函数定义时就确定了函数的作用域，所以闭包返回的函数可以访问定义时的作用域链中的变量。

## 语法
```js
function counterInit() {
  let count = 0;
  return function() {
    return count++;
  }
}

const counter = counterInit();
console.log(counter()); // 0
console.log(counter()); // 1
console.log(counter()); // 2
```
上面的示例中，`counterInit` 将内部函数返回，内部函数可以访问父级作用域的 `count` 变量，这个变量在形式上是私有的，没有任何方法可以直接访问它。
并且在 `counterInit` 执行完毕后，`count` 也不会被销毁。

## 应用
### 模拟私有变量和私有方法

闭包可以用来模拟私有变量和私有方法。通过在函数内部定义变量和函数，并返回一个对象来访问这些变量和函数，可以实现私有变量和私有方法的效果。
```js
function createCounter() {
  let count = 0; // 私有变量

  return {
    increment: function() { // 私有方法
      count++;
      return count;
    },
    decrement: function() { // 私有方法
      count--;
      return count;
    },
    getCount: function() { // 私有方法
      return count;
    }
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.decrement()); // 1
console.log(counter.getCount());  // 1
```

### 防抖和节流
#### 防抖
防抖函数的目的是将多次触发的操作（如输入事件）合并为一次执行，在指定的时间延迟内如果再次触发则会重新计时，最终只执行最后一次操作。
```js
// 防抖函数：接收两个参数，func 是要执行的函数，delay 是延迟时间（毫秒）
function debounce(func, delay) {
  let timeoutId; // 通过闭包保存 timeoutId，用于控制定时器

  // 返回一个函数，该函数作为事件处理器
  return function(...args) {
    const context = this; // 保存当前的上下文 (this)，在稍后调用 func 时使用

    // 如果事件在 delay 时间内再次触发，清除之前的定时器，重新计时
    clearTimeout(timeoutId);

    // 设置新的定时器，延迟 delay 毫秒后执行 func
    timeoutId = setTimeout(() => {
      // 使用 apply 确保 func 以正确的上下文执行，并传入事件参数
      func.apply(context, args);
    }, delay);
  };
}

// 示例：防抖应用于输入框的输入事件处理
const inputHandler = debounce(function() {
  // 只有在用户停止输入后 300 毫秒才会打印输入的内容
  console.log('输入完成:', this.value); // this 指向输入框元素
}, 300);

// 绑定输入框的输入事件到防抖函数
document.getElementById('inputBox').addEventListener('input', inputHandler);
```

#### 节流
节流函数的目的是限制某个函数的执行频率，即在指定时间间隔内最多只能执行一次。即使事件频繁触发，函数也只能在特定的时间段内执行一次。
```js
// 节流函数：接收两个参数，func 是要执行的函数，interval 是时间间隔（毫秒）
function throttle(func, interval) {
  let lastExecTime = 0; // 使用闭包保存上次函数执行的时间

  // 返回一个函数，该函数作为事件处理器
  return function(...args) {
    const context = this; // 保存当前的上下文 (this)

    const currentTime = Date.now(); // 获取当前时间戳

    // 如果距离上次执行的时间超过了设定的间隔时间，则执行函数
    if (currentTime - lastExecTime >= interval) {
      // 使用 apply 确保 func 以正确的上下文执行，并传入事件参数
      func.apply(context, args);
      lastExecTime = currentTime; // 更新上次执行的时间
    }
  };
}

// 示例：节流应用于窗口滚动事件
const scrollHandler = throttle(function() {
  // 滚动过程中每 200 毫秒只记录一次滚动位置
  console.log('滚动位置:', window.scrollY); // 打印当前的垂直滚动位置
}, 200);

// 绑定滚动事件到节流函数
window.addEventListener('scroll', scrollHandler);
```

### 柯里化

## ES6+ `class` 代替闭包实现私有属性
在 ES6+ 中，可以使用 `class` 来代替闭包实现私有属性的效果，使其只能在类内部被访问。
```js
class Counter {
  #count = 0; // 私有变量

  increment() {
    this.#count++;
    return this.#count;
  }

  decrement() {
    this.#count--;
    return this.#count;
  }

  #getPrivateCount() { // 私有方法
    return this.#count;
  }
  
  getPublicCount() {
    return this.#getPrivateCount()
  }
}

const counter = new Counter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.decrement()); // 1
console.log(counter.getPublicCount());  // 1
console.log(counter.#count);  // Private name #count is not defined.
console.log(counter.#getPrivateCount());  // Private name #getPrivateCount is not defined.
```
这种方式比闭包更具可读性和安全性，因为私有字段是语法级别的特性，确保了私有属性的真正隔离。
