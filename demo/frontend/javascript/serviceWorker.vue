<script setup>
const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      // 注意，这个文件的相对 URL 是相对于源（origin）的，而不是相对于引用这个文件的JS文件的位置
      const registration = await navigator.serviceWorker.register("/star-doc/demo/frontend/javascript/serviceWorker.js");
      if (registration.installing) {
        console.log("正在安装 Service worker");
      } else if (registration.waiting) {
        console.log("已安装 Service worker installed");
      } else if (registration.active) {
        console.log("激活 Service worker");
      }
      console.log(navigator.serviceWorker.controller);
      if (navigator.serviceWorker.controller) {
        // 使用 postMessage 发送消息
        navigator.serviceWorker.controller.postMessage({ action: 'SYNC_DATA', data: 'hello from main thread' });
      }

      navigator.serviceWorker.addEventListener('message', event => {
        console.log('收到来自 Service Worker 的消息:', event.data);

        if (event.data.action === 'DATA_SYNCED') {
          console.log(event.data.message); // 输出“数据已同步！”
        }
      });
    } catch (error) {
      console.error(`注册失败：${error}`);
    }
  }
};
console.log(1);

registerServiceWorker();
</script>

<template>
  <div>
    <h1>Service Worker</h1>
    <p>请打开控制台查看输出</p>
  </div>
</template>
