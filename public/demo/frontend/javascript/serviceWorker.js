self.addEventListener('install', function (event) {
  console.log('Service Worker 安装中...');
  event.waitUntil(
    // 方法为事件完成后指定回调函数。
    caches.open('demo-cache-v1').then(function (cache) {})
  );
});

self.addEventListener("activate", function(event) {
  console.log("Service Worker 激活中...");
  let cacheWhitelist = ["demo-cache-v1"];  // 允许的缓存版本
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);  // 删除旧的缓存
          }
        })
      );
    })
  );
});


self.addEventListener('message', event => {
  console.log('收到主线程的消息:', event.data);

  // 执行一些操作，如同步数据等
  if (event.data.action === 'SYNC_DATA') {
    console.log('同步数据请求:', event.data.data);

    // 回复消息给所有关联的客户端
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ action: 'DATA_SYNCED', message: '数据已同步！' });
        });
      })
    );
  }
});
