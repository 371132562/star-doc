# 执行上下文、调用栈与作用域

## 执行上下文（Execution Context）
JavaScript 代码在执行时实际上是运行在执行上下文中。每当 JavaScript 代码执行时，都会创建一个执行上下文。它包含了代码执行的必要信息，主要包括以下 **三部分**：
- 变量对象（Variable Object，VO）：存储变量、函数声明、形参等数据的对象。
- 作用域链（Scope Chain）：用来保证对变量和函数的有序访问。它包含当前执行上下文的变量对象及其所有父级执行上下文的变量对象。
- this：指向当前执行上下文中所引用的对象。

下边三种代码创建了对应的 **三种类型** 的执行上下文：
- 全局执行上下文：在代码开始执行时自动创建，整个程序中只有一个，且在程序退出时被销毁。它是为那些存在于 JavaScript 函数之外的任何代码而创建的。
- 函数执行上下文：每当一个函数被调用时，都会为该函数创建一个新的执行上下文。
- eval 执行上下文：当使用 eval() 函数执行代码时，会为 eval 创建一个执行上下文。

### 动态创建
执行上下文是在 **函数调用时** 动态创建的。每次函数调用时，都会创建一个新的执行上下文。
典型的例子就是`this`的指向，`this`的指向依赖于执行上下文。
```javascript
const obj1 = {
  name: 'Object 1',
  greet: function() {
    console.log(`Hello, my name is ${this.name}`);
  }
};

const obj2 = {
  name: 'Object 2'
};

// 直接调用 obj1.greet()，此时的执行上下文绑定了 obj1
obj1.greet(); // 输出: Hello, my name is Object 1 // [!code highlight]

// 将 obj1.greet 赋值给一个变量并调用
const greetFn = obj1.greet;
greetFn(); // 输出: Hello, my name is undefined // [!code highlight]
// (或某些情况下是 'Hello, my name is [空字符串]')

// 使用 call 方法明确指定执行上下文为 obj2
greetFn.call(obj2); // 输出: Hello, my name is Object 2 // [!code highlight]
```

## 调用栈（Call Stack）{#call-stack}
顾名思义，调用栈是一个 **LIFO（后进先出）** 的栈数据结构，用来存储代码执行的执行上下文。

当 JavaScript 开始执行一段代码时，会首先将 全局执行上下文 压入调用栈。
当调用一个函数时，函数的执行上下文也会被压入栈顶。函数执行完毕后，执行上下文将从调用栈中弹出，程序的控制权回到调用栈中的下一个上下文。

以下边的代码为例展示执行上下文的产生和销毁，以及调用栈的运行过程
```javascript
function foo(i) {
  if (i < 0) return;
  console.log('begin:' + i);
  foo(i - 1);
  console.log('end:' + i);
}
foo(2);

// 输出结果
"begin:2"
"begin:1"
"begin:0"
"end:0"
"end:1"
"end:2"
```
![调用栈运行过程](/images/callstack-flow.png)
> [!WARNING]
> 调用栈是有大小的，当入栈的执行上下文超过一定数目，或达到最大调用深度，就会出现栈溢出（Stack Overflow）的问题，这在递归代码中很容易出现。

## 作用域（Scope）
作用域是指程序中变量和函数的可访问范围，同时是一个让变量不会向外暴露出去的独立区域，能够隔离变脸，不同作用域下同名变量不会有冲突。

JavaScript 中有以下几种作用域：
- 全局作用域：在全局上下文中声明的变量或函数可以在整个程序中访问。
- 函数作用域：在函数内部声明的变量或函数只能在该函数内部访问。
- 块级作用域：在 `let`、`const` 声明变量时，会创建一个块级作用域，只在代码块 `{}` 内部有效。ES6 之前，JavaScript 不支持块级作用域，只有全局作用域和函数作用域。

### 作用域链（Scope Chain）
作用域链是由 **当前执行上下文** 的变量对象和 **所有父级执行上下文** 的变量对象组成的链表结构，用来保证对变量和函数的有序访问。

当在某个作用域中访问变量时，JavaScript 会首先在当前作用域查找，如果没有找到，就会沿着作用域链向外层作用域查找，直到找到该变量或者到达全局作用域。
如果仍然找不到，就会抛出`ReferenceError`错误。

### 静态创建
JavaScript 采用的是 **词法作用域（Lexical Scope）**，这意味着作用域及作用域链在代码定义时就已经确定，而不是在代码运行时动态决定的。
```js
var globalVar = 'global';

function outer() {
  var outerVar = 'outer';

  function inner() {
    console.log(globalVar); // 从全局作用域查找
    console.log(outerVar);  // 从外部函数的作用域查找
  }

  return inner;
}

const fn = outer();
fn(); // 输出 'global', 'outer'
```
在这个例子中，`inner` 函数作用域及作用域链已经在定义时确定，即 `inner` 函数的作用域链包含 `outer` 函数的作用域和全局作用域。
因此它可以访问到 `outerVar` 和 `globalVar`。
