# Javascript模块 {#javascriptModules}

## 背景 {#background}

由于`Javascript`的发展，Web端和`NodeJs`中的代码规模越发庞大和复杂，为了解决代码的可维护性和可复用性，产生了模块化的概念。
早期社区提出了诸如`CommonJS`、`AMD`、`CMD`和`UMD`等模块化规范，后来ES6中也加入了官方标准模块系统，并且得到了浏览器和`NodeJs`的原生支持。

> [!NOTE] Babel
> 由于社区规范并未得到浏览器的原生支持，因此需要使用构建工具（如`Webpack`、`Rollup`等）和`Babel`的能力将模块化代码转换为浏览器可识别的代码。
> 但是，ES6模块化规范已经得到了浏览器和`NodeJs`的原生支持，因此可以直接使用。
> 
> 如果目的是为了使用较新且并未得到浏览器支持的`Javascript`特性，仍可以使用`Babel`进行转换。

## CommonJS {#commonjs}

`CommonJS`是最早提出的，目前在`NodeJs`仍然广泛使用的一种模块化规范，在Web端开发的过程中如果使用到了`CommonJS`，则需要通过构建工具将其转化为浏览器可识别的代码。

### 相关语法

通过`require`和`module.exports`两个关键字实现模块化。
::: code-group
```js [module.js]
// 导出
class MyClass {
    constructor(name) {
        this.name = name;
    }
    greet() {
        console.log(`Hello, ${this.name}!`);
    }
}

module.exports = MyClass; // [!code highlight]
```
```js [require.js]
// 导入
const MyClass = require('./myClass'); // [!code highlight]

const instance = new MyClass('Alice');
instance.greet(); // 输出 'Hello, Alice!'
```
:::

### 特点
- **同步加载**

  `CommonJS`针对服务器端的模块规范，模块是同步加载的，因此在加载模块时会阻塞后续代码的执行，所以并不适合在浏览器端使用，会阻塞页面加载导致性能下降。

- **单次加载**

  `Commonjs`是运行时加载（区别于`ESM`的编译时输出接口），模块在第一次被加载时会执行一次将执行结果即**模块对象**返回并**缓存**，后续再次加载时直接返回缓存结果。
  > [!NOTE]
  > 有些情况下，你可能希望模块不被缓存，可以通过`delete require.cache[require.resolve('./myClass')]`来删除缓存。

## AMD {#amd}

`AMD`是一种用于浏览器端的JavaScript模块化规范，旨在解决传统脚本文件依赖和加载的问题。它通过异步加载模块来提高页面性能，特别是在需要加载多个模块的情况下。并不常用，了解即可。

### 相关语法

::: code-group
```js [module.js]
// 导出
// define 函数：用于定义一个模块。它接受模块的名称（可选），外部依赖数组（可选），
// 以及一个模块主体回调函数（必须）。主体函数用于创建模块，返回模块的输出。
define('moduleName', ['module1', 'module2'], function(dep1, dep2) {
  // 这里的外部依赖 module1 和 module2 会在一开始就加载和执行 // [!code highlight]
  // 模块代码
  var moduleAPI = {
    // 模块的API
  };
  return moduleAPI;
});
```
```js [require.js]
// 导入
// require 函数：用于加载一个或多个模块，
// 并在加载完成后执行一个回调函数。它接受依赖模块的数组和一个回调函数。
require(['module1', 'module2'], function(mod1, mod2) {
  // 当module1和module2加载完成后，这里的代码才会执行
});
```
:::

### 特点
- **异步且并行加载**
    
  `AMD`模块是异步加载的，因此在加载模块时不会阻塞后续代码的执行，并且可以充分使用浏览器机制并行加载多个文件，适合在浏览器端使用。

### 缺陷
- **外部依赖在定义时加载**

  `AMD`模块文件在JS引擎执行时会异步请求，解析并执行`define`参数中的外部依赖`module1`、`module2`等等，即使有些依赖在特定条件下才会被用到，
甚至所有依赖都并未使用，其仍会在所有依赖模块加载并执行完毕后才会执行主模块的回调函数（即模块主体），这会导致模块的加载和执行时间较长。会增加不必要的网络请求。

## CMD {#cmd}

`CMD`规范专注于浏览器端的模块加载，并解决了模块在浏览器端异步加载的问题。与`AMD`规范类似`CMD`也主要用于浏览器端的模块化开发，
但它在模块定义和依赖的处理上与`AMD`略有不同。并不常用，了解即可。

### 相关语法

```js
// CMD 模块定义 包括导出和导入
//
// define 函数：用于定义一个模块。这个函数接受一个回调函数作为参数，
// 该回调函数会立即执行，并为模块提供 require、exports 和 module 三个参数。
//
// require 函数：用于导入依赖模块。在 CMD 中，require 可以在模块内部的任何地方使用，
// 不需要提前声明所有的依赖。只有在代码运行到 require 时，
// 才会去加载和执行所依赖的模块，这就是 CMD 的 按需加载 特性。

define(function(require, exports, module) {
  // 通过 require 导入依赖模块
  var mod1 = require('./module1');
  var mod2 = require('./module2');

  // 使用导入的模块
  mod1.doSomething();
  mod2.doAnotherThing();

  // 定义模块的导出
  exports.myFunction = function() {
    console.log('This is my module!');
  };
});

```

### 特点
- **按需加载**

  `CMD`允许`require`调用放在模块代码中的任意位置。`JavaScript`解释器在解析模块定义时，并不会立即加载`require`中的模块。 
当代码执行到`require('module1')`语句时，`CMD`才会实际请求并加载`module1`。此时解释器暂停当前模块的执行，加载并执行`module1`，
然后返回`module1`的导出内容，接着继续执行主模块。减少不必要的资源加载。

## UMD {#umd}
由于这些模块系统的不兼容性，开发者在构建可以在多种环境中使用的库时，面临着需要为不同的模块系统编写不同版本代码的问题。
`UMD`规范的出现旨在解决这一问题，它允许同一个模块在不同的模块系统（如AMD、CommonJS和浏览器全局变量）中运行，确保代码的广泛兼容性。
并不常用，了解即可。

### 相关语法

```js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD 环境
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS 环境
        module.exports = factory();
    } else {
        // 浏览器全局环境
        root.MyModule = factory();
    }
}
(typeof self !== 'undefined' ? self : this, function () {
    // 模块代码在此
    var MyModule = {
        hello: function() {
            console.log('Hello, UMD!');
        }
    };
    
    return MyModule;
})
);
```
1. 通过一个立即执行的函数表达式来封装模块，以避免污染全局作用域。
接受两个参数：root（通常是 window 或 global）和 factory（一个返回模块内容的函数）。

   - 第一个参数：typeof self !== 'undefined' ? self : this。这段代码用于获取全局对象的引用。在浏览器环境中是 window，在 Web Worker 中是 self，在 Node.js 环境中是 global。

   - 第二个参数：function () { ... }。这是一个工厂函数，用于实际定义模块的内容。

### 特点
- **高度兼容性**

   通过同时支持 AMD、CommonJS 和浏览器全局变量，UMD 提供了极高的环境兼容性。只需编写一次代码，就可以在多个环境中运行。
   
### 缺陷
- **代码冗余**

  为了兼容不同的模块系统，UMD 代码通常会比较冗长，这会增加代码的体积，并且增加维护成本。

## ESM {#esm}
前边所讲到的规范是社区提出的，而`ESM`是`ECMAScript`官方提出的模块化规范，它在`ES6`中被正式引入，作为JavaScript语言规范的一部分，目前已经得到了浏览器和`NodeJs`的原生支持。

### 相关语法

- **导出方式**
```js
// 两种导出方式可以同时存在
// 命名导出
export const PI = 3.14;
export function add(x, y) {
    return x + y;
}

// 默认导出
export default function subtract(x, y) {
  return x - y;
}
```

- **导入方式**
::: code-group
```js [命名导入]
import { PI, add } from './math.js';

console.log(PI); // 3.14
console.log(add(2, 3)); // 5
```
```js [默认导入]
import subtract from './math.js';

console.log(subtract(3,2)); // 1
```
```js [混合导入]
import subtract, { PI, add } from './math.js';

console.log(subtract(3,2)); // 1
console.log(PI); // 3.14
console.log(add(2, 3)); // 5
```
```js [全部导入]
// 这将获取模块的全部导出，并且提供自己的命名空间
import * as math from './math.js';

console.log(math.PI); // 3.14
console.log(math.add(2, 3)); // 5
console.log(math.default(3, 2)); // 1  默认导出会挂载在全部导入到模块对象的default属性上
```
:::

> [!NOTE] 重命名导出与导入
> 在你的 import 和 export 语句的大括号中，可以使用 as 关键字跟一个新的名字，来改变你在顶级模块中将要使用的功能的标识名字，这种方式可以用来避免命名冲突。
> ::: code-group
> ```js [export.js]
> const PI = 3.14;
> function add(x, y) {
>   return x + y;
> }
> 
> export { PI as newExportPI, add as newExportAdd };
> ```
> ```js [import.js]
> import {
> newExportPI as newImportPI,
> newExportAdd as newImportAdd
> } from './math.js';
>
> console.log(newImportPI); // 3.14
> console.log(newImportAdd(2,3)); // 5
> ```
> :::

- **动态导入**

  `ESM`的动态导入是通过`import()`函数实现的。这种导入方式与静态的`import`语句不同，它是在代码执行期间动态地加载模块。
`import()`函数返回一个`Promise`，当模块加载完成后，`Promise`解析为该模块的对象。
```js
import("/modules/mymodule.js").then((module) => {
  // Do something with the module.
  console.log(module.PI) // 3.14
  console.log(module.add(2,3)) // 5
  console.log(module.default(3,2)) //1
});
```


### 特点
- **异步加载**

  当浏览器遇到`<script type="module">`标签时，它会异步下载，执行在`HTML`文档完全解析后开始，不会阻塞`HTML`的解析。在这一点上与`<script defer>`处理时机相同。

  一旦所有的依赖模块加载完毕，浏览器会按照模块的依赖顺序来执行。模块执行顺序依赖于导入的顺序和依赖关系，模块内部会递归地加载所有依赖的模块，确保一个模块不会在其依赖的模块之前执行。
  
  > [!NOTE]
  > 在早期的构建工具（如`webpack`）中，`ESM`模块会被转换为转换为其他模块格式，如`CommonJS`或`IIFE`，
  > 这种转换使得代码能够兼容更广泛的浏览器环境，特别是那些不完全支持 ESM 的老旧浏览器。
  > 
  > 在较新的构建工具（如`vite`，`Rollup`），虽然会对代码内容比如一些非原生的语言格式（`Typescript`）进行处理和转换，但最终输出的格式仍然是`ESM`。
  > 其`script`标签中会带有`type="module"`属性。

- **静态分析**

  **能够做到静态分析的原因**：
    1. 所有的`import`和`export`语句必须位于模块的顶级作用域中，不能在函数、条件语句、循环或者其他块级作用域内。这是因为这些语句需要在代码的静态解析阶段被处理，而不是在运行时。
    2. `ESM`只允许使用静态的、明确的字符串作为模块路径，不能使用变量或动态计算的路径。
    3. `ESM`导入的绑定是只读的，不能重新赋值。
    4. `ESM`导出不是一个对象，而是一组静态绑定的接口，是值的引用。这些接口在模块加载时就已经确定。

    >   [!NOTE]
    >   由于`Commonjs`与上述特点相反的灵活性和动态性，导致了`Commonjs`模块的静态分析困难，在构建时不便于进行摇树优化。
    >   在[Webpack5](https://webpack.docschina.org/blog/2020-10-10-webpack-5-release/#commonjs-tree-shaking)中对`Commonjs`的未使用导出做了处理。

  **静态分析所带来的优势**：
    - 摇树（`Tree Shaking`）
  
    由于静态分析可以识别出哪些代码片段（如函数、变量、模块等）在项目中未被使用，因此可以在构建时将这些无用代码从最终的输出中删除，减少代码体积。
    并且识别模块间的依赖关系，将代码分割成更小的块（chunks），这些块可以按需加载。这种按需加载的方式能显著减少初始加载时。

    - 代码分割和按需加载
  
    动态导入天然支持代码分割和按需加载，可以根据需要在运行时加载模块，而不是一次性加载所有模块。静态导入可以通过构建工具实现同样的优化策略。
    这种方式可以减少初始加载时的资源消耗，提高页面性能。
  
## `cjs`和`mjs`

`JavaScript`中的`.cjs`和`.mjs`，分别用于指示文件内容使用的是 CommonJS 模块系统和 ECMAScript 模块系统。

在`Node.js`中，`package.json`文件的`type`字段决定了文件的默认模块系统：

`"type": "commonjs"`(默认)：该包中的`.js`文件将被视为 CommonJS 模块。\
`"type": "module"`：该包中的 .js 文件将被视为 ESM 模块。

`.cjs`在`Node.js`中将文件强制解析为`CommonJS`模块，`.mjs`在`Node.js`中将文件强制解析为`ESM`模块。而不受`package.json`中`type`字段的影响。

### CommonJS 模块加载 ESM 模块

`CommonJS`的`require()`命令不能加载`ESM`模块，会报错，只能使用`import()`这个方法加载。
```js
(async () => { 
  await import('./moudule.mjs');
})();
```
`require()`不支持`ESM`模块的一个原因是，它是同步加载，而`ESM`模块内部可以使用顶层`await`命令，导致无法被同步加载。

### ESM 模块加载 CommonJS 模块

`ESM`模块的`import`命令可以加载`CommonJS`模块，但是只能整体加载，不能只加载单一的输出项。
```js
// 正确
import packageMain from 'commonjs-package';

// 报错
import { method } from 'commonjs-package';
```
这是因为`ESM`模块需要支持静态代码分析，而`CommonJS`模块的输出接口是`module.exports`，是一个对象，无法被静态分析，所以只能整体加载。
