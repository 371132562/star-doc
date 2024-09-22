# 短路逻辑 {#shortCircuitLogic}

> 本章节内容涉及[类型转换](./typeConversion)的内容，会将操作数转换为布尔值
> （[真值](https://developer.mozilla.org/zh-CN/docs/Glossary/Truthy)和[假值](https://developer.mozilla.org/zh-CN/docs/Glossary/Falsy)）

## 逻辑与(`&&`) {#and}

逻辑与是一种短路运算符，从左到右对操作数求值，遇到第一个**假值**操作数时立即返回，它不会对任何剩余的操作数求值；如果所有的操作数都是真值，则返回最后一个操作数的值。
```js
result = "" && "foo"; // 结果被赋值为 ""（空字符串）
result = 2 && 0; // 结果被赋值为 0
result = "foo" && 4; // 结果被赋值为 4
```

> [!NOTE]
> 逻辑与赋值（x &&= y）运算仅在 x 为真值时为其赋值，等价于`x && (x = y);`。
> ```js
> const x = 0;
> x &&= 2; //因为并没有执行赋值操作，所以const赋值错误不会被抛出。
>
> const y = 0;
> y &&= console.log("y 进行了求值"); // 什么都不会输出
> ```

## 逻辑或(`||`) {#or}

逻辑或也是一种短路运算符，从左到右对操作数求值，遇到第一个**真值**操作数时立即返回，它不会对任何剩余的操作数求值；如果所有的操作数都是假值，则返回最后一个操作数的值。
```js
result = "" || "foo"; // 结果被赋值为 "foo"
result = 2 || 0; // 结果被赋值为 2
result = "foo" || 4; // 结果被赋值为 "foo"
```

> [!NOTE]
> 逻辑或赋值（x ||= y）运算仅在 x 为假值时为其赋值，等价于`x || (x = y);`。
> ```js
> const x = 2;
> x ||= 3; //因为并没有执行赋值操作，所以const赋值错误不会被抛出。
> 
> const y = 2;
> y ||= console.log("y 进行了求值"); // 什么都不会输出
> ```
