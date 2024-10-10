# Background Sync API
`Background Sync API` 是一个允许你在设备网络连接断开时注册任务，并在网络恢复时自动执行这些任务的 API。这个 API 通过 `Service Worker` 来实现。

当你在提交数据或者聊天等场景中时，为了避免因网络原因导致的数据丢失，你可以使用这个 API 结合 `IndexedDB` 来保证数据传输的可靠性。
::: info NOTE
`localStorage` 是同步的 API，会阻塞操作。而 `Service Worker` 运行在单独的线程中，设计上是非阻塞的，所有的 API 都应该是异步的。
为了避免阻塞、保证性能，不允许使用同步的存储 API。
:::

## 使用方法
在这里省去了 `Service Worker` 的注册步骤和一些基础事件，如果你还不了解其用法，请查看 [Service Worker](./worker#service-worker)。

### 注册后台同步任务
`sync.register` 方法用于注册一个后台同步任务，它接收一个 `tag` 参数作为标识符，用于在 `sync` 事件触发时区分不同的同步任务。

该事件在下一步中只会被触发一次，完成后被移除，再次注册后才会被另外触发。
```javascript
navigator.serviceWorker.ready.then(registration => {
  registration.sync.register('offlineData').then(() => {
    console.log('离线同步事件注册成功');
  });
});
```

### 监听网络连接状态
```js
self.addEventListener('sync', (event) => {
  console.log('离线同步事件触发');
  if (event.tag === 'offlineData') {
    console.log('tag为offlineData的离线同步事件触发');
  }
});
```
::: info NOTE
经过在 Edge 129 版本中的测试，表现为，如果你注册任务时，网络是连接的，那么 `sync` 事件会立即触发，如果网络是断开的，那么 `sync` 事件会在网络恢复后触发。
:::
