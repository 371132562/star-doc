# Worker
众所周知JS是单线程的，JS代码是按照[事件循环机制](./eventLoop)执行的，所以长耗时任务会造成页面UI阻塞，这就是JS的缺点之一。

HTML5标准提供了 `Worker API`，使得在主线程之外的后台线程中运行JS脚本操作成为可能，这种方式使主线程（通常是 UI 线程）的运行不会被阻塞/放慢。

## 基本概念和分类
`Worker` 是使用构造函数创建的对象，它在一个独立线程中运行一个指定的 JS 脚本文件。
主线程和 `Worker` 不在同一个上下文环境，通过 `postMessage` 方法来发送消息（**只能传递可以由
[结构化克隆算法](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) 处理的值和对象**），通过
`onmessage` 事件来接收消息。

要注意的是在 `Worker` 中不能访问主线程的 `DOM`，或使用 `window` 对象中的某些方法和属性。

可以发出异步请求，但同样需要符合同源策略。

无法读取本地文件。

---

`Worker` 大致有以下三类：
- `Web Worker`：细分为两种，专用 Worker（`Dedicated Worker`）和共享 Worker（`Shared Worker`），主要用于网页后台处理长时间任务和计算密集型任务，如数据处理、大规模计算。
- `Service Worker`：即使用户关闭页面，`Service Worker` 仍然可以在后台运行，主要用于实现离线缓存、消息推送等场景。
  > [!NOTE]
  > 上面两种类型的 `Worker` 内部可以使用 `importScripts` 方法可以引入外部脚本，每个脚本中的全局对象都能够被 worker 使用，并且与主线程隔离。 不能直接引入模块化文件。
  > ```js
  > importScripts(); /* 什么都不引入 */
  > importScripts("foo.js"); /* 只引入 "foo.js" */
  > importScripts("foo.js", "bar.js"); /* 引入两个脚本 */
  > importScripts("//example.com/hello.js"); /* 你可以从其他来源导入脚本 */
  > ```
- `Worklet`：一种更轻量级的 Worker，可以运行 `JavaScript` 和 `WebAssembly` 代码来执行需要高性能的图形渲染或音频处理。
  > [!NOTE]
  > 不能使用 `importScripts()`，通常会通过 `addModule()` 来加载模块。

## Web Worker
### 专用 Worker（`Dedicated Worker`）
是最基础的 `Worker` 类型，通过 `new Worker()` 来创建，它与创建它的页面一对一绑定，仅供单个页面使用。
::: code-group
```js [main.js]
// 创建 Worker
const worker = new Worker('worker.js');

worker.postMessage('Hello from Main Thread');

worker.onmessage = (event) => {
  console.log('Message from Worker:', event.data);
};

worker.onerror = (event) => {
  console.log("There is an error with your worker!");
};

//终止 Worker
worker.terminate();
```
```js [worker.js]
onmessage = function(event) {
  console.log('Message from Main Thread:', event.data);
  postMessage('Hello from Worker');
};
```
:::
> [!NOTE]
> 在主线程中使用时，`onmessage` 和 `postMessage()` 必须挂在 `Worker` 对象上，而在 `Worker` 文件中使用时不用这样做。原因是，在 `Worker` 内部其作用域是全局作用域。

这样创建的 `Worker` **代码易懂，通信简单，但是无法在多个页面之间共享数据**。即使使用相同的代码和同一个JS文件，每个页面也会创建一个新的 `Worker` 实例，之间并无关联。

当不需要多页面共享数据时，可以使用这种方式。

---
### 共享 `Worker`（`Shared Worker`）
在 **同一个浏览器** 的不同标签页，如果满足 **同源策略** 并且使用 **相同的 `Worker` 文件路径**，可以共享同一个 `Worker` 实例，实现多个页面之间的通信。
> [!WARNING]
> 如果文件路径不同（即使内容相同），它们也会创建不同的 `Worker` 实例。

通过 `new SharedWorker()` 来创建，并使用 `MessagePort` 进行通信。具体的使用方式相较于 `Dedicated Worker` 稍显复杂，我们通过代码示例来了解。
::: code-group
```js [main.js]
// 主线程
if (window.SharedWorker) {
  // 创建实例后即会触发 sharedworker.js 中的 onconnect 事件
  const sharedWorker = new SharedWorker('shared-worker.js');

  // 开始通信，MessagePort 必须手动调用 start()
  sharedWorker.port.start();

  // 向 Shared Worker 发送消息
  sharedWorker.port.postMessage('Hello from Main Thread 1');

  // 接收来自 Shared Worker 的消息
  sharedWorker.port.onmessage = function(event) {
    console.log('Message from Shared Worker:', event.data);
  };

  // 页面关闭时，关闭与 Shared Worker 的通信
  window.onunload = function() {
    sharedWorker.port.close();
  };
}
```
```js [worker.js]
// Shared Worker
let ports = []; // 存储所有连接的端口

onconnect = function(event) {
  const port = event.ports[0];
  ports.push(port);

  port.start();
  
  port.onmessage = function(event) {
    console.log('Received from page:', event.data);

    // 向所有连接的页面广播消息
    ports.forEach((p) => p.postMessage(event.data + ' (broadcasted to all pages)'));
  };
};
```
:::

---
#### 多方通信
可以看到，`Shared Worker` 可以与多个页面通信，在主线程中通过 `SharedWorker.port` 进行消息的发送和接收。 

在 `Worker` 文件中通过 `event.ports` 来获取当前连接的页面的 `MessagePort` 对象。
虽然 `event.ports` 是一个数组，但在 `Shared Worker` 的 `onconnect` 事件中，它通常只包含一个元素，即当前新连接的页面的 `MessagePort` 对象。
也就是我们所需要的 `event.ports[0]`。

所以在 `onconnect` 事件中，我们需要将所有的 `MessagePort` 对象存储起来，以便后续向所有页面广播消息。如有必要，可以自行编写逻辑进行消息的区分和筛选。

---
#### 通信开启
在 `Shared Worker` 中，`MessagePort` 并不会自动监听或处理消息。打开方式是使用 `onmessage` 事件处理函数或者 `start()` 方法。
如果这两个方法都没有调用，`postMessage` 可以正常发出消息，但不会有任何响应。

在手动调用 `start()` 方法并且绑定 `onmessage` 事件处理函数后，消息才能正常接收。
需要注意的是，**绑定 `onmessage` 的动作其实已经完成了消息的监听，所以 `start()` 方法可以省略**。
::: code-group
```js [main.js]
// 主线程
if (window.SharedWorker) {
  // 创建实例后即会触发 sharedworker.js 中的 onconnect 事件
  const sharedWorker = new SharedWorker('shared-worker.js');

  // 省略 start() 方法
  sharedWorker.port.start(); // [!code --]

  // 向 Shared Worker 发送消息
  sharedWorker.port.postMessage('Hello from Main Thread 1');

  // 接收来自 Shared Worker 的消息
  sharedWorker.port.onmessage = function(event) {
    console.log('Message from Shared Worker:', event.data);
  };

  // 页面关闭时，关闭与 Shared Worker 的通信
  window.onunload = function() {
    sharedWorker.port.close();
  };
}
```
```js [worker.js]
// Shared Worker
let ports = []; // 存储所有连接的端口

onconnect = function(event) {
  const port = event.ports[0];
  ports.push(port);

  // 省略 start() 方法
  port.start(); // [!code --]
  
  port.onmessage = function(event) {
    console.log('Received from page:', event.data);

    // 向所有连接的页面广播消息
    ports.forEach((p) => p.postMessage(event.data + ' (broadcasted to all pages)'));
  };
};
```
:::
通常情况下只有一种情况需要手动调用 `start()` 方法，即使用 `addEventListener()` 来监听 `message` 事件时，你必须手动调用 `start()`，否则通信不会自动开始。
```js{5,8-10}
// 主线程
const sharedWorker = new SharedWorker('shared-worker.js');

// 必须手动调用 start() 来启动通信
sharedWorker.port.start();

// 使用 addEventListener 监听消息
sharedWorker.port.addEventListener('message', function(event) {
  console.log('Received from Shared Worker:', event.data);
});

sharedWorker.port.postMessage('Hello from Main Thread');
```

`Shared Worker` 便于多个页面之间共享数据，多个页面共享同一个 `Worker`，避免了每个页面都创建独立 `Worker` 的资源开销。

但是其通信机制相较于 `Dedicated Worker` 更为复杂，需要注意并发消息的处理。

---
### 使用模块化文件
`Worker` 的构造函数接收两个参数，一个是上述示例中已经涉及到的 `URL` 参数，另一个是 `options` 参数，
可以在后者中设置 `type: 'module'` 来使用模块化JS文件创建 `Worker`。

`options` 可配置项包括
- `name`：`Worker` 的名称，用于调试目的。
---
- `type`：`Worker` 的类型，可以是 `classic` 或 `module`，默认为 `classic`。
  - `classic`：传统的 `Worker` 类型。
  - `module`：模块化的 `Worker` 类型，`Worker` 文件内部支持 `ESM` 语法。
---
- `credentials`：允许你指定是否应该发送和接收与请求相关的认证信息（如 `cookies`、HTTP 认证或客户端 SSL 证书）。
如果未指定，或者 `type` 是 `classic`，将使用默认值 `omit` (不要求凭证)。
  - `omit`：不要求凭证。
  - `same-origin`：只在同源请求时发送凭证。如果请求的资源与当前页面在同一个域，则会发送 cookies 和其他认证信息。
  - `include`：总是发送凭证，即使是跨域请求。
---

#### 模块化专用 Worker（`Dedicated Worker`）
::: code-group
```js [main.js]
// 在主线程中创建模块化的 Dedicated Worker
const worker = new Worker('worker.js', { type: 'module' });

// 向 Worker 发送消息
worker.postMessage('Hello from Main Thread');

// 接收 Worker 的消息
worker.onmessage = (event) => {
  console.log('Received from Worker:', event.data);
};
```
```js [worker.js]
// 导出一个函数，这在模块化文件中是允许的
export function greet() {
  return 'Hello from Worker';
}

// 监听消息
self.onmessage = (event) => {
  console.log('Received in Worker:', event.data);

  // 使用模块化的导出函数
  const message = greet();

  // 发送消息回主线程
  self.postMessage(message);
};
```
:::

---
#### 模块化共享 Worker（`Shared Worker`）
::: code-group
```js [main.js]
// 在主线程中创建模块化的 Shared Worker
const sharedWorker = new SharedWorker('shared-worker.js', { type: 'module' });

// 启动通信
sharedWorker.port.start();

// 向 Shared Worker 发送消息
sharedWorker.port.postMessage('Hello from Main Thread');

// 接收 Shared Worker 的消息
sharedWorker.port.onmessage = (event) => {
  console.log('Received from Shared Worker:', event.data);
};
```
```js [worker.js]
// 导出一个函数，用于模块化开发
export function greet() {
  return 'Hello from Shared Worker';
}

// 监听连接事件
self.onconnect = (event) => {
  const port = event.ports[0];

  // 监听消息
  port.onmessage = (event) => {
    console.log('Received in Shared Worker:', event.data);

    // 使用模块化的导出函数
    const message = greet();

    // 发送消息回主线程
    port.postMessage(message);
  };
};
```
:::

## Service Worker
### 基本概念
![Service Worker](/images/worker-service-worker.png)
`Service Worker` 是一种运行在浏览器后台的脚本，独立于网页，已经注册 `Worker` 的页面标签页即使关闭但浏览器未关闭的情况下，`Service Worker` 仍然可以运行。

它具有监听和拦截网络请求、缓存数据、推送消息等功能。所以本质上充当 Web 应用程序、浏览器与网络（可用时）之间的代理服务器。适合不需要在前台展示和交互的功能。

当 `Service Worker` 被成功注册并激活，在网络不可用时，`Service Worker` 可以通过拦截网络请求，返回已缓存数据来提供离线体验。

#### 缓存 API
在讲解工作流程之前，我们先了解一下 `Service Worker` 中的重要组成部分缓存 API。

`Service Worker` 使用 [`CacheStorage`](https://developer.mozilla.org/zh-CN/docs/Web/API/CacheStorage) 对象来管理缓存，
`CacheStorage` 是一个全局对象，可以通过 `caches` 属性访问。
通过它我们能创建多个具体的 [`Cache`](https://developer.mozilla.org/zh-CN/docs/Web/API/Cache) 缓存实例，每个实例都可以存储多个 `Request` 和 `Response` 对。

##### `CacheStorage`
```js
// 打开指定名称的缓存实例。如果不存在，则创建新的缓存实例。
caches.open('my-cache').then(function(cache) {
  console.log('缓存实例已打开:', cache);
});

// 检查是否存在指定名称的缓存实例。
caches.has('my-cache').then(function(exists) {
  if (exists) {
    console.log('缓存实例存在');
  } else {
    console.log('缓存实例不存在');
  }
});

// 删除指定名称的缓存实例。
caches.delete('my-cache').then(function(success) {
  if (success) {
    console.log('缓存实例已删除');
  } else {
    console.log('删除缓存实例失败');
  }
});

// 获取所有缓存实例的名称（缓存键）。
caches.keys().then(function(cacheNames) {
  console.log('所有缓存实例名称:', cacheNames);
});

// 从所有缓存实例中查找与指定 Request 匹配的 Response。
// 它会依次检查每个缓存实例，直到找到第一个匹配项并返回。
// 如果找不到匹配的资源，则返回 undefined。
caches.match('/index.html').then(function(response) {
  if (response) {
    console.log('在某个缓存实例中找到了响应:', response);
  } else {
    console.log('未找到匹配的响应');
  }
});

```

##### `Cache`
```js
caches.open('my-cache').then(function(cache) {
  // 查找缓存中与指定 Request 匹配的 Response。返回第一个匹配的结果。
  cache.match('/index.html').then(function(response) {
    if (response) {
      console.log('从缓存中找到的响应:', response);
    } else {
      console.log('没有匹配的缓存响应');
    }
  });
  
  // 查找全部缓存中与指定 Request 匹配的 Response。
  cache.matchAll('/index.html').then(function(responses) {
    console.log('所有匹配的缓存响应:', responses);
  });
  
  // 注意 add() 和 addAll() 中的相对 URL 参数是相对于当前 worker 文件的路径，而不是 origin。 // [!code highlight]
  // 从网络获取一个资源并将其添加到缓存中。
  cache.add('/styles.css').then(function() {
    console.log('资源已成功缓存');
  });
  
  // 从网络获取多个资源并将它们添加到缓存中。
  cache.addAll(['/index.html', '/styles.css', '/script.js']).then(function() {
    console.log('多个资源已成功缓存');
  });
  
  // 从缓存中删除指定 Request 对应的 Response。
  cache.delete('/styles.css').then(function(success) {
    if (success) {
      console.log('缓存项已删除');
    }
  });
  
  // 返回缓存中所有请求的键（即所有缓存的 Request 对象）。
  cache.keys().then(function(keys) {
    console.log('缓存中的所有请求:', keys);
  });
  
  // 将指定的 Request 和 Response 对存储到缓存中。
  // 因为 Response 对象是流，只能使用一次 // [!code highlight]
  // 所以如果你需要多次使用或者将其 return 的情况下，必须使用 clone() 方法。// [!code highlight]
  fetch('/data.json').then(function(response) {
    return caches.open('my-cache').then(function(cache) {
      // 把响应缓存起来
      cache.put('/data.json', response.clone());
      return response;  // 返回原始响应
    });
  }).then(function(response) {
    // 在这里再使用响应，比如显示数据
    response.json().then(function(data) {
      console.log('页面数据:', data);
    });
  });
  
  // 通常如果你只是想fetch一个或多个请求然后直接将结果存储在缓存中 // [!code highlight]
  // 推荐使用add()或者addAll() // [!code highlight]
  // put() 更适合于指定任意的 Request 和 Response 组合。
  // 创建自定义请求
  let request = new Request('/custom-text', { method: 'GET' });

  // 创建自定义响应
  let response = new Response('This is a custom text response', {
    headers: { 'Content-Type': 'text/plain' }
  });

  // 存入缓存
  cache.put(request, response).then(function() {
    console.log('自定义文本响应已存入缓存');
  });
});
```

---
### 工作流程
出于安全原因，`Service Worker` 必须在 `HTTPS` 环境下才能使用，或者在 `localhost` 环境下开发调试。

#### 注册 `Service Worker`
使用 `serviceWorkerContainer.register(url)` 来注册 `Service Worker`。注册后运行在独立线程（`ServiceWorkerGlobalScope`）中，不能直接操作 `DOM`。

注册方法返回的是一个 `Promise`，所以可以通过 `then` 和 `catch` 或 `await` 来处理注册成功和失败的情况。
成功时会返回一个 [`ServiceWorkerRegistration`](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration) 对象，
可以通过它来获取 `Service Worker` 的状态和控制它。
```js
const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      // 注意，这个文件的相对 URL 是相对于源（origin）的，而不是相对于引用这个文件的JS文件的位置 // [!code highlight]
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/", // 将 Service Worker 的作用域设置在根目录
      });
      if (registration.installing) {
        console.log("正在安装 Service worker");
      } else if (registration.waiting) {
        console.log("已安装 Service worker installed");
      } else if (registration.active) {
        console.log("激活 Service worker");
      }
    } catch (error) {
      console.error(`注册失败：${error}`);
    }
  }
};

// …

registerServiceWorker();
```
> [!NOTE]
> `scope` 选项用于指定 `Service Worker` 的作用域，即它可以控制的页面范围。这是一个可选参数，默认非显式指定的情况下，`Service Worker` 的作用域是注册它的页面所在的目录。
> ```js
> // 默认行为，这种情况下只会控制 /example/ 路径及其子路径内的所有页面和资源
> navigator.serviceWorker.register('/example/service-worker.js')
> .then(function(registration) {
>   console.log('Service Worker 注册成功，作用域为:', registration.scope);
> })
> 
> // 显式指定作用域，只会控制 /example/subdirectory/ 路径及其子路径内的页面和资源。
> navigator.serviceWorker.register('/example/service-worker.js', {
>   scope: '/example/subdirectory/'
> })
> .then(function(registration) {
>   console.log('Service Worker 注册成功，作用域为:', registration.scope);
> })
> ```

#### 安装事件
`install` 事件是 `Service Worker` 的生命周期中的第一个事件，会在注册成功完成之后触发。此阶段通常用于缓存一些关键资源，为离线访问做准备。

通常会使用 `CacheStorage` 和 `Cache` API。
```js
self.addEventListener('install', function(event) {
  console.log('Service Worker 安装中...');
  event.waitUntil( // 方法为事件完成后指定回调函数。
    caches.open('my-cache').then(function(cache) {
      return cache.addAll([
        '/index.html',
        '/styles.css',
        '/script.js',
        '/offline.html'
      ]);
    })
  );
});
```

#### 等待激活
安装完成后，新的 `Service Worker` 会进入等待激活状态。这是因为之前版本的 `Service Worker` 可能还控制着当前页面。我们不希望多个版本的 `Service Worker` 同时运行。
一旦所有被旧版本控制的页面都关闭，新版本的 `Service Worker` 就会被激活。会触发 `activate` 事件。

通过手动调用 `skipWaiting()`，新版本的 `Service Worker` 可以立刻激活，不必等到所有旧页面关闭后才生效。
```js
self.addEventListener('install', function(event) {
  self.skipWaiting();  // 立即激活新的 Service Worker
  console.log('新的 Service Worker 版本跳过等待并立即激活。');
});
```
首次注册的 `Service Worker` 会跳过等待并立即激活，但是之后的更新版本会等待旧版本的页面关闭后才激活。

#### 激活事件
`activate` 事件通常用于清理旧缓存或其他资源。激活后，新版本开始接管页面的控制。
```js
self.addEventListener("activate", function(event) {
  console.log("Service Worker 激活中...");
  let cacheWhitelist = ["my-cache"];  // 允许的缓存版本
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
```

#### 控制页面
通常情况下，`Service Worker` 只会控制那些在它**注册并激活之后**打开的页面。已经打开的页面不会立即受到新 `Service Worker` 的控制，除非用户刷新这些页面。

如果你需要立即让它接管所有客户端（页面或其他控制范围内的请求），包括那些在 `Service Worker` 激活之前已经打开的页面。
可以手动调用`clients.claim()`。
```js
self.addEventListener('activate', function(event) {
  // 激活事件中调用 claim() 方法
  event.waitUntil(
    self.clients.claim().then(() => {
      console.log('Service Worker 已激活并立即控制所有客户端');
    })
  );
});
```

#### 重复以上步骤
每当获取新版本的 `Service Worker` 时，都会再次发生此循环，并在新版本的激活期间清理上一个版本的残留。

---
### 通信
::: details 关于通信在实际环境中的可用性有待验证，仅供参考
`Service Worker` 同样也可以与主线程之间实现通信，主要通过 `postMessage` 方法和 `message` 事件来实现。

**主线程发送并监听消息**
```js
// 主线程（页面脚本）中发送消息给 Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
    console.log('Service Worker 注册成功:', registration);

    // 确保有激活的 Service Worker，才能发送消息
    if (navigator.serviceWorker.controller) {
      // 使用 postMessage 发送消息
      navigator.serviceWorker.controller.postMessage({ action: 'SYNC_DATA', data: 'hello from main thread' });
    }
  });
}

// 主线程监听来自 Service Worker 的消息
navigator.serviceWorker.addEventListener('message', event => {
  console.log('收到来自 Service Worker 的消息:', event.data);

  if (event.data.action === 'DATA_SYNCED') {
    console.log(event.data.message); // 输出“数据已同步！”
  }
});
```

**`Service Worker` 监听消息并回复**
```js
// 在 Service Worker 中监听来自主线程的消息
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
```
> [!NOTE]
> [`clients.matchAll()`](https://developer.mozilla.org/zh-CN/docs/Web/API/Clients/matchAll) 是用于获取与当前 `Service Worker` 相关联的所有客户端的方法，
> 返回一个 `Promise`，包含所有匹配的客户端对象列表。
:::

---
### 应用场景
- **离线缓存**

用户首次访问应用时缓存资源，之后即使网络不可用也可以访问。
```js
// 在 install 事件中缓存应用的静态资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('offline-cache').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/app.js',
        '/logo.png'
      ]);
    })
  );
});

// 在 fetch 事件中从缓存中读取资源
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // 如果缓存中有请求的资源，返回缓存
      return response || fetch(event.request);
    })
  );
});
```

---
- **离线优先策略**

这个策略在用户访问过某些资源后，将其缓存。之后的请求优先从缓存中获取，这对于用户访问相同内容的场景非常有用。
```js
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(networkResponse => {
        // 将从网络获取的响应放入缓存中
        return caches.open('dynamic-cache').then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});
```

---
- **网络优先策略**

当你希望资源始终是最新的，但同时希望在网络不可用时能够从缓存中提供数据时，可以使用网络优先策略。
```js
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).then(response => {
      return caches.open('api-cache').then(cache => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch(() => {
      // 如果网络请求失败（如离线），从缓存中读取
      return caches.match(event.request);
    })
  );
});
```

---
- **按需缓存**

用户在访问某些页面时，才动态缓存该页面的资源，而不提前缓存所有资源。
```js
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/dynamic-page')) {
    event.respondWith(
            caches.match(event.request).then(response => {
              return response || fetch(event.request).then(networkResponse => {
                return caches.open('dynamic-cache').then(cache => {
                  cache.put(event.request, networkResponse.clone());
                  return networkResponse;
                });
              });
            })
    );
  }
});
```

---
- **后台同步**

后台同步允许当用户离线时，`Service Worker` 可以使用 [Background Sync API](./backgroundSyncAPI) 缓存用户的操作（如表单提交），并在网络恢复时重新发送这些请求。
```js
self.addEventListener('sync', event => {
  if (event.tag === 'sync-form-submission') {
    event.waitUntil(
      // 发送之前保存的请求
      sendCachedRequests().then(() => {
        console.log('表单数据已在网络恢复后同步提交');
      })
    );
  }
});

// 模拟保存请求并在网络恢复时发送
function sendCachedRequests() {
  // 此处你可以从 IndexedDB 或 Cache 中获取离线时缓存的请求
  return fetch('/submit-form', { method: 'POST', body: JSON.stringify({ name: 'John Doe' }) });
}
```

---
- **推送通知**

为用户提供消息推送功能，无论应用是否在前台运行，都可以通过 `Service Worker` 发送通知。
```js
const title =  '通知';
const options = {
  body: '这是来自 Service Worker 的通知调用',
};
self.registration.showNotification(title, options)
```
### DEMO
[Service Worker Demo](https://star-adventure.vercel.app/demo/frontend/javascript/worker)

在这个DEMO中请求了一个实际上并不存在的接口，但是由于`Service Worker`的缓存策略，在控制台的 `network` 详情中我们可以看到直接从缓存中获取了数据 `200 OK （自service worker）`。

## `Worklet`
[待补充](https://developer.mozilla.org/en-US/docs/Web/API/Worklet)
