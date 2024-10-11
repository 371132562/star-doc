# 原型和原型链
原型和原型链是面向对象编程的重要概念，尤其是在对象继承和共享属性的机制中发挥了核心作用。

已知在 JavaScript 中有两大类数据类型，分别是原始类型和引用类型。

引用类型中如普通对象、数组、函数等，它们直接继承自 `Object`。
而原始类型中如 `number`、`string`、`boolean`、`symbol`，它们虽然不是对象，但在访问属性和方法时会被临时转换为相应的包装对象，这些包装对象同样继承自 `Object`。

在平常的开发中，原型和原型链无时无刻不在发挥作用。

![原型和原型链](/images/prototypeChain.jpg)

## 原型
每个 JavaScript 对象（无论是普通对象还是函数对象）在创建时都会关联一个原型对象。
```js
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function() {
  console.log(`Hello, my name is ${this.name}`);
};

const alice = new Person('Alice');
alice.sayHello(); // 输出：Hello, my name is Alice

console.log(alice.__proto__ === Person.prototype); // true
```

### `prototype`
`prototype` 是 **函数对象特有** 的属性，它指向一个对象，这个对象包含了由该函数创建的所有实例共享的属性和方法。

当使用构造函数创建对象时，生成的实例的原型指向构造函数的 `prototype` 对象。

我们将上方示例中由 `Person` 构造函数创建的 `alice` 实例打印可以看到如下结果。
```js
console.log(alice);
// Person { name: 'Alice' }
//   name: "Alice"
//   [[Prototype]]: Object
//     sayHello: ƒ ()
//     constructor: ƒ Person(name)
//     [[Prototype]]: Object
```
其内部属性包含了 `name` 和 `[[Prototype]]`，`name` 是实例自身的属性，而 `[[Prototype]]` 是指向构造函数的 `prototype` 对象
（其中包含了在原型中定义的 `sayHello` 方法验证了这一点）。

**通过在 `prototype` 上定义属性和方法，可以实现所有实例之间的共享，减少内存占用。**

::: info NOTE
`[[Prototype]]` 代指 Javascript 内部属性，不是标准的可访问属性。但常见情况下浏览器可以用 `__proto__` 来访问到该属性，更推荐使用 `Object.getPrototypeOf` 来获取原型。
:::

### `__proto__`
`__proto__` 是 **每个对象都有** 的属性，它指向该对象的原型，也就是构造函数的 `prototype` 对象。
```js
console.log(alice.__proto__ === Person.prototype); // true
console.log(getPrototypeOf(alice) === Person.prototype); // true
```

### `constructor`
构造函数的 `prototype` 对象中有一个 `constructor` 属性，指向构造函数本身。
```js
console.log(Person.prototype.constructor === Person); // true
```
了解即可，与原型和原型链的关系不大。

### 创建对象的方式
使用 `new` 创建的对象，可以自动绑定构造函数的 `prototype`，从而建立对象与构造函数之间的原型链，是一种 **隐式指定**。

使用字面量形式创建的对象和使用 `new` 创建的对象从原型和原型链的角度来说没有区别。
```js
const obj1 = {};
console.log(obj1.__proto__ === Object.prototype); // true

const obj2 = new Object();
console.log(obj2.__proto__ === Object.prototype); // true
```
但在创建对象时，字面量形式无法直接指定对象的原型链，只会 **默认指定** `Object.prototype`。
使用 `new` 则可以调用任意的构造函数，从而指定对象的原型链。

`Object.create()` 是创建对象的另一种方式，它允许我们 **显式指定** 新对象的原型，而不是通过构造函数隐式设置。
`Object.create()` 不会执行构造函数，它只创建一个新对象并设置该对象的原型。
```js
const personPrototype = {
  sayHello: function() {
    console.log(`Hello, my name is ${this.name}`);
  }
};

const john = Object.create(personPrototype); // 使用现有的对象作为原型
john.name = 'John';
john.age = 30;

console.log(john.name); // 输出：John
john.sayHello(); // 输出：Hello, my name is John
console.log(john.__proto__ === personPrototype); // true
```

### ES6 `class` 语法中的原型与继承
在 ES6 引入了 `class` 语法后，尽管表面上是类的形式，但本质上仍然是基于原型的继承机制。
通过 `class` 语法定义类，仍然会通过原型链实现继承。

```js
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    console.log(`${this.name} makes a noise.`);
  }
}

class Dog extends Animal {
  speak() {
    console.log(`${this.name} barks.`);
  }
}

const d = new Dog('Rex');
d.speak(); // Rex barks.
```
尽管 `class` 语法的表现形式看起来类似其他面向对象语言的类继承，但它背后的实现依然基于 JavaScript 的原型机制。

## 原型链
了解了以上概念之后，我们知道可以通过 `[[Prototype]]` 来访问对象的原型。

当我们访问对象的某个属性或者方法时，如果对象本身不存在查找目标，就会向其原型对象查找， 如果原型对象中也不存在，就会继续向上查找。
直到找到 `Object.prototype`，如果还没有找到，就会返回 `undefined`。

这样就形成了一条链式结构，即原型链，原型链的顶端是 `Object.prototype`。
```js
// 定义祖父原型
const grandparent = {
  familyName: 'Smith',
  greet: function() {
    console.log(`Hello from ${this.familyName}`);
  }
};

// 定义父原型，并设置它的原型为 grandparent
const parent = Object.create(grandparent);
parent.firstName = 'John'; // 添加父对象特有的属性

// 定义子对象，并设置它的原型为 parent
const child = Object.create(parent);
child.age = 12; // 添加子对象特有的属性

console.log(child.age); // 自身属性 输出: 12
console.log(child.firstName); // 继承自父对象 输出: John
console.log(child.familyName); // 继承自祖父对象 输出: Smith
child.greet(); // 调用祖父对象的原型方法 输出: Hello from Smith

console.log(child.height); // 输出: undefined

console.log(child.__proto__ === parent);        // true
console.log(parent.__proto__ === grandparent);  // true
console.log(grandparent.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__ === null); // true
```

## `Object.getPrototypeOf` 和 `Object.setPrototypeOf`
除了使用 `__proto__` 访问对象的原型，我们更推荐使用 `Object.getPrototypeOf` 和 `Object.setPrototypeOf` 来显式获取或设置对象的原型。

```js
const obj = {};
const proto = Object.getPrototypeOf(obj);
console.log(proto === Object.prototype); // true

Object.setPrototypeOf(obj, null);
console.log(Object.getPrototypeOf(obj)); // null
```
显式地获取和设置原型对象有助于更好地控制对象的原型链，特别是在设计需要动态变更原型的场景时。

## `hasOwnProperty` 的使用
在通过原型链访问属性时，可能会遇到继承自原型链上的属性。为了区分对象自身属性和继承属性，`hasOwnProperty` 方法非常有用：
```js
const obj = { a: 1 };
console.log(obj.hasOwnProperty('a')); // true
console.log(obj.hasOwnProperty('toString')); // false, 因为 toString 在原型链上
```

## 总结
- 每个对象都有一个 `[[Prototype]]` 属性，指向其原型对象。
- 每个函数对象都有一个 `prototype` 属性，指向一个对象，这个对象包含了由该函数创建的所有实例共享的属性和方法。
- `Object.prototype` 没有原型对象，它是原型链的顶端。
- 通过原型链，可以实现对象之间的继承和共享属性。
- 使用 ES6 的 `class` 语法可以更简洁地定义类与继承，但其背后仍然基于原型链实现。
