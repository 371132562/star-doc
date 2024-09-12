# 类型转换 {#typeConversion}
`JavaScript`是弱类型语言，这意味着它不像`Java`，`C++`一样的强类型语言有预先确定的类型。你可以使用与预期类型不同类型的值，并且`Javascript`将为你转换它为正确的类型，这种被动的类型转换被称为`隐式类型转换`或`强制类型转换`。通常在JS当中只存在其他类型向`String,Number,Boolean`的转换。

## `Number()`转换规则 {#Number}

- **数值**：直接返回。
- **布尔值**：`true`转换为`1`，`false`转换为`0`。
- **null**：返回`0`。
- **undefined**：返回`NaN`。
- **字符串**：应用以下规则：
  - 如果字符串包含数值字符，包括数值字符前面带加、减号的情况，则转换为一个十进制数值。
  - 如果字符串包含有效的浮点值格式如"1.1"，则会转换为相应的浮点值（同样，忽略前面的零）。
  - 如果字符串包含有效的十六进制格式如"0xf"，则会转换为与该十六进制值对应的十进制整数值。
  - 如果是空字符串（不包含字符），则返回0。
  - 如果字符串包含除上述情况之外的其他字符，则返回NaN。
- **Symbol**：会抛出`TypeError`错误。
- **[对象](#Object)**：调用`valueOf()`方法，并按照上述规则转换返回的值。如果转换结果是`NaN`，则调用`toString()`方法，再按照转换字符串的规则转换。
> [!NOTE]
> 一元加操作符与`Number()`函数遵循相同的转换规则，属于强制数字转换，可用于快捷转换字符串类型的数字。

## `String()`转换规则 {#String}

- **字符串**：直接返回原字符串。
- **数值**：直接转换为相应的字符串形式。例如，`123`转换为`"123"`，`0`转换为`"0"`。
- **布尔值**：`true`转换为`"true"`，`false`转换为`"false"`。
- **null**：转换为`"null"`字符串。
- **undefined**：转换为`"undefined"`字符串。
- **Symbol**：直接转换为字符串。例如，`Symbol(description)`转换为`"Symbol(description)"`。
- **[对象](#Object)**：调用`toString()`方法并返回结果。如果`toString()`方法返回对象而非原始类型，再调用`valueOf()`方法，并将其结果转换为字符串。
  - 如果`toString()`方法存在并返回原始类型（通常是字符串），直接使用此结果。
  - 如果`valueOf()`返回原始类型，则使用其字符串形式。
  - 如果两个方法都没有返回原始类型，将抛出`TypeError`错误。

## `Boolean()`转换规则 {#Boolean}

- **数值**：
  - `0`和`NaN`转换为`false`。
  - 任何非零数值（包括正数和负数）转换为`true`。
- **字符串**：
  - 空字符串 `""` 转换为`false`。
  - 非空字符串（包括包含空格的字符串）转换为`true`。
- **null**：转换为`false`。
- **undefined**：转换为`false`。
- **Symbol**：任何Symbol值转换为`true`。
- **[对象](#Object)**：
  - 任何对象（包括空对象、数组、函数等）转换为`true`。
  - 即使是空数组 `[]` 或空对象 `{}`，也转换为`true`。

> [!NOTE]
> 在条件判断中（如`if`语句中），JavaScript会自动使用`Boolean()`的转换规则，将表达式转换为布尔值以决定代码的执行路径。
> ```js
> if({}){
>   console.log(true)
> }
> // true
> ```

> [!NOTE]
> 逻辑非操作符也可以用于把任意值转换为布尔值。同时使用两个叹号（!!），相当于调用了转型函数`Boolean()`。

## Object {#Object}
> JavaScript中的对象转换为原始类型主要依赖于[`[Symbol.toPrimitive]`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toPrimitive)、
[`valueOf()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/valueOf)
和[`toString()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/toString)方法。

当JavaScript需要将一个对象转换为原始类型时，它会按照以下步骤进行：

首先检查对象是否有`[Symbol.toPrimitive]`(ES6之后可手动定义)方法：

如果对象定义了这个方法，JavaScript会调用它，传递一个提示参数(hint)来指定期望的转换类型。注意，`[Symbol.toPrimitive]`只被允许返回一个**原始类型值**。
```js
let obj = {
    [Symbol.toPrimitive](hint) {
        if (hint === "number") {
            return 10;
        }
        if (hint === "string") {
            return "String value";
        }
        return true;
    }
};

console.log(Number(obj)); // 输出: 10
console.log(String(obj)); // 输出: "String value"
console.log(obj + 1); // 输出: "true1" (默认转换为布尔值 true)

```
> [!NOTE]
> hint参数提示了期望的原始类型，它可以是"string"、"number"或"default"

如果没有定义`[Symbol.toPrimitive]`：

- ### 强制基本类型转换和强制数字类型转换

hint为`"default"`或`"number"`

JavaScript首先调用`valueOf()`方法。如果`valueOf()`返回原始类型（如数字、字符串、布尔值），则使用该值。如果返回的是对象，JavaScript会继续调用`toString()`方法并使用它的返回值。

- ### 强制字符串转换

hint为`"string"`

JavaScript首先调用`toString()`方法。如果`toString()`返回原始类型，则使用该值。如果返回的是对象，JavaScript会调用`valueOf()`方法并使用它的返回值。

如果这两个方法都返回对象而不是原始值，那么JavaScript会抛出一个`TypeError`错误，表示无法进行有效的转换。

> [!NOTE] 总结
> Boolean：所有对象（包括空对象、数组等）都转换为`true`。\
> Number：优先调用`valueOf()`，然后调用`toString()`，无法转换则返回`NaN`。\
> String：优先调用`toString()`，然后调用`valueOf()`，如果都无法返回原始值，抛出错误。

## 加法操作符 {#plus}

### 操作数均为数值

- 如果有任一操作数是`NaN`，则返回`NaN`；
- 如果是`Infinity`加`Infinity`，则返回`Infinity`；
- 如果是`-Infinity`加`-Infinity`，则返回`-Infinity`；
- 如果是`Infinity`加`-Infinity`，则返回`NaN`；
- 如果是`+0`加`+0`，则返回`+0`；
- 如果是`-0`加`+0`，则返回`+0`；
- 如果是`-0`加`-0`，则返回`-0`。

### 至少一个操作数为字符串

- 如果两个操作数都是字符串，则将第二个字符串拼接到第一个字符串后面；
- 如果只有一个操作数是字符串，则将另一个操作数转换为字符串，再将两个字符串拼接在一起。

### 任一操作数是对象、布尔值或`null` `undefined`

- 对象：JavaScript首先调用`valueOf()`方法。如果返回原始值（如数字或字符串），则直接使用；如果不是，则调用`toString()`方法获取字符串表示，然后拼接。
- 布尔值：会被自动转换为字符串，再应用前面的字符串拼接规则。
- `undefined`和`null`：分别调用`String()`函数，将它们转换为`"undefined"`和`"null"`，再拼接。

## 关系操作符 {#relational}

### 一般比较

   - 如果操作数都是数值，则执行数值比较。
   - 如果操作数都是字符串，则比较字符串中第一个字符的编码，逐字符进行比较。
   - 如果有任一操作数是数值，则将另一个操作数尝试转换为数值，执行数值比较。
   - 如果有任一操作数是对象，则调用其`valueOf()`方法，取得结果后再根据前面的规则执行比较。如果`valueOf()`结果不是原始值，则调用`toString()`方法，再根据字符串的规则执行比较。
   - 如果有任一操作数是布尔值，则将其转换为数值再执行比较,`true`转换为`1`，`false`转换为`0`。

### 特殊情况

   - `null`被转换为`0`，参与数值比较。
   - `undefined`被转换为`NaN`，任何与`NaN`的比较结果都为`false`。

## 相等操作符 {#equal}

> Javascript中有[三种不同的相等性判断](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Equality_comparisons_and_sameness)：`==`、`===`和`Object.is()`。
> [同值相等`Object.is()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Equality_comparisons_and_sameness#%E4%BD%BF%E7%94%A8_object.is_%E8%BF%9B%E8%A1%8C%E5%90%8C%E5%80%BC%E7%9B%B8%E7%AD%89%E6%AF%94%E8%BE%83)与[零值相等](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Equality_comparisons_and_sameness#%E9%9B%B6%E5%80%BC%E7%9B%B8%E7%AD%89)并不常用，不在此赘述。

### 严格相等

- 非相同类型的比较直接返回`false`。
- 相同类型相同值的比较一般返回`true`，但有以下特殊情况：
   - `NaN` 与任何值（包括自身）的比较结果都为`false`。
   - `0`与`-0`被认为是相等的，因此`0 === -0`返回 `true`。  
   - 只有当两个对象引用同一内存地址时，比较结果才为`true`。

> [!NOTE]
> 在日常中使用严格相等几乎总是正确的选择。

### 宽松相等

- **相同类型的数据比较与严格相等相同**。
- **非相同类型的数据比较时会发生隐式类型转换**。
  1. `null`和`undefined`在宽松相等判断中被认为是相等的，但它们与其他类型（如数值、布尔值、字符串等）不相等。
  2. 当一方为数值类型时，会尝试将另一方按照[`Number()`](#Number)规则进行转换后比较。
  3. 当一方为布尔值时，会将布尔值转化为数值，然后根据第2条规则进行比较。
  4. 当一方为字符串时，会将另一方转化为字符串进行比较。
  5. `Symbol`与`Symbol.for()`
```js
// Symbol()
let sym1 = Symbol('foo');
let sym2 = Symbol('foo');
console.log(sym1 == sym2);  // false, 即使描述相同，Symbol 是唯一的
console.log(sym1 === sym2);  // false, 同样严格相等也为 false

let sym3 = sym1;
console.log(sym1 == sym3);  // true, 因为 sym1 和 sym3 引用同一个 Symbol 实例

// Symbol.for()
let globalSym1 = Symbol.for('foo');
let globalSym2 = Symbol.for('foo');
console.log(globalSym1 == globalSym2);  // true, 因为它们通过相同的字符串在全局注册表中创建
```

> [!NOTE]
> 在大多数情况下，不建议使用宽松相等。使用严格相等进行比较的结果更容易预测，并且由于缺少类型强制转换可以更快地执行。
