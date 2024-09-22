# valueOf和toString

通常情况下，我们不需要直接调用`valueOf()`和`toString()`方法，因为 JavaScript 引擎需要原始值时自动调用这两个方法。

## `valueOf()`

对于原始类型（如数值、字符串、布尔值），`valueOf()`返回的是它们的原始值，即它们自身。
```js
console.log((123).valueOf());  // 123, 数值原始类型返回自身
console.log(("hello").valueOf());  // "hello", 字符串原始类型返回自身
console.log((true).valueOf());  // true, 布尔值原始类型返回自身
```

对于对象类型（如数组、对象、函数、正则表达式和Symbol等），valueOf() 默认返回的是对象自身的引用。
```js
// 对象
let obj = { a: 1 };
console.log(obj.valueOf() === obj);  // true, 对象类型返回自身引用

// 数组
let arr = [1, 2, 3];
console.log(arr.valueOf() === arr);  // true

// 函数
function fn() {}
console.log(fn.valueOf() === fn);  // true
```

特殊类型（如 Date）会根据特定逻辑返回值（如时间戳）。
```js
let date = new Date(2024, 0, 1);
console.log(date.valueOf());  // 返回日期对应的时间戳
```

可以通过自定义对象的 valueOf() 方法来改变其返回的原始值。
```js
let myObj = { 
  valueOf: function() {
    return 123;
  }
};
console.log(myObj.valueOf());  // 123, 自定义对象返回 123 作为原始值
```

## `toString()`

对于原始类型（如数值、字符串、布尔值）以及`null`和`undefined`，`toString()`返回的是对应的字符串表示。

对于普通对象`Object`，`toString()`默认返回`"[object Type]"`。这里的 Type 是对象的类型。如果对象有`Symbol.toStringTag`属性，其值是一个字符串，则它的值将被用作`Type`。
许多内置的对象，包括`Map`和`Symbol`，都有`Symbol.toStringTag`。一些早于ES6的对象没有`Symbol.toStringTag`，但仍然有一个特殊的标签。它们包括（标签与下面给出的类型名相同）：
- Array
- Function（它的 typeof 返回 "function"）
- Error
- Boolean
- Number
- String
- Date
- RegExp
- Null
- Undefined

> [!NOTE]
> `Symbol.toStringTag`允许自定义修改，所以如果使用此方法来判断对象类型，需要注意。
> ```js
> const myDate = new Date();
> Object.prototype.toString.call(myDate); // [object Date]
>
> myDate[Symbol.toStringTag] = "myDate";
> Object.prototype.toString.call(myDate); // [object myDate]
>
> Date.prototype[Symbol.toStringTag] = "prototype polluted";
> Object.prototype.toString.call(new Date()); // [object prototype polluted]
> ```

> [!NOTE]
> 下面将会提到的几种特殊的对象有其自己的`toString()`实现，但仍可通过手动调用`Object.prototype.toString.call(obj)`来获取其`"[object Type]"`类型。

对于数组会返回一个以逗号拼接的字符串。

对于`Date`对象，返回的是日期的字符串表示，具体格式因浏览器和时区设置而异。

对于正则表达式和函数，返回的是正则表达式和函数的字符串源码。

对于`Symbol`类型，返回的是`"Symbol(value)"`。

```js
let sym = Symbol("foo");
console.log(sym.toString());  // "Symbol(foo)"
```
