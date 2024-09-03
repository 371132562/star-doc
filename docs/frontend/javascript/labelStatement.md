# 标签语句 {#labelStatement}

标签语句`label: statement`是一种标记代码块的方法，可以在代码中任意位置使用。标签语句的语法如下：

```js
start: for (let i = 0; i < count; i++) { // [!code highlight]
  console.log(i);
}
```

`break`和`continue`都可以与标签语句一起使用，返回代码中特定的位置。这通常是在嵌套循环中，如下面的例子所示：
```js
let num = 0;
outermost: // [!code highlight]
for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    if (i == 5 && j == 5) {
      break outermost; // [!code highlight]
    }
    num++;
  }
}
console.log(num); // 55
```
添加标签不仅让`break`退出（使用变量`j`的）内部循环，也会退出（使用变量`i`的）的外部循环。当执行到`i`和`j`都等于`5`时，循环停止执行，此时`num`的值是`55`。
`continue`语句也可以使用标签。
