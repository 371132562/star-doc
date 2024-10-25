# MutationObserver

`MutationObserver` 是一种用于监视 `DOM` 树中变化的 JavaScript API。

它基于异步事件通知机制，并在微任务队列（microtask queue）中执行，避免了同步操作带来的性能问题。

通过监听节点的属性变更、子节点增删、文本内容变化等，`MutationObserver` 可以高效跟踪页面的动态变更。
::: tip
该 API 注册的回调函数是异步执行的，会将其加入微任务队列，不会阻塞主线程。
:::

## 语法
```js
// 创建一个 MutationObserver 实例
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    console.log(mutation);
  });
});

// 目标节点
const targetNode = document.getElementById('example');

// 配置选项
const config = { childList: true, attributes: true, subtree: true };

// 启动观察
observer.observe(targetNode, config);

// 当 DOM 发生变化时，MutationObserver 将这些变更存储在内部队列中，
// 然后在当前事件循环完成后才会调用回调。
// takeRecords 方法用于获取所有未处理的变更记录并清空队列，在新的变更发生之前将不会再触发回调。
// 通常用于想在 MutationObserver 回调之前获取变更记录。
const records = observer.takeRecords();
records.forEach((record) => console.log('TakeRecords:', record));

// 停止观察
observer.disconnect();
```

### `observe` 第二个参数 `options`

`MutationObserver.observe` 方法的第二个可选参数 `options` 是一个对象，用于指定要观察的变更类型。各配置项的作用如下：

- **childList**（布尔值，默认值：`false`）：是否观察目标节点的 **直接子节点** 结构增删操作。
- **subtree**（布尔值，默认值：`false`）：是否递归观察目标节点及其 **整个子树的所有变化**。
- **attributes**（布尔值，默认值：`true`,如果声明了 `attributeFilter` 或 `attributeOldValue`，默认值则为 false）：是否观察目标节点的属性变化。
- **attributeOldValue**（布尔值，默认值：`false`）：是否记录属性变更前的旧值（需配合 `attributes` 一起使用）。
- **characterData**（布尔值，默认值：`true`，如果声明了 `characterDataOldValue`，默认值则为 `false`）：是否观察目标节点的文本内容变化（适用于文本节点）。
- **characterDataOldValue**（布尔值，默认值：`false`）：是否记录文本内容变化前的旧值（需配合 `characterData` 一起使用）。
- **attributeFilter**（数组，默认值：`undefined`）：指定要观察的属性名列表，仅监控数组中指定的属性。
```javascript
// 创建 MutationObserver
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    console.log('Mutation type:', mutation.type);
    console.log('Target node:', mutation.target);
    console.log('Old value (if available):', mutation.oldValue);
  });
});

// 选择要观察的节点
const targetNode = document.getElementById('example');

// 设置观察选项
const config = {
  childList: true,               // 观察子节点的增删
  subtree: true,                  // 递归观察整个子树
  attributes: true,               // 观察属性变化
  attributeOldValue: true,        // 记录属性变更前的旧值
  characterData: true,            // 观察文本节点的内容变化
  characterDataOldValue: true,    // 记录文本内容变化前的旧值
  attributeFilter: ['class', 'id'] // 仅观察 class 和 id 属性的变化
};

// 启动观察
observer.observe(targetNode, config);

// 示例变更操作
targetNode.classList.add('new-class');            // 将触发属性变更回调
targetNode.textContent = 'Updated content';       // 将触发文本内容变更回调
const newElement = document.createElement('div');
targetNode.appendChild(newElement);               // 将触发子节点增删回调
```

## 应用场景
- **表单验证**：监听表单元素的值变化，实时校验输入内容。
- **监控 `DOM` 元素属性变更**：在使用 Vue 或 React 进行数据驱动开发时，可以检测某些属性的变化以触发相应操作。

## DEMO
[DEMO](https://star-adventure.vercel.app/demo/frontend/javascript/mutationObserver)
