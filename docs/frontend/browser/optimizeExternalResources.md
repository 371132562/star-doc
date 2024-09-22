# 外部资源引入优化 {#optimizeExternalResources}

## 资源引入方式
在HTML文档中引入外部资源的方式有两种，`link`和`script`。

## `preload`和`prefetch`
`link`通常用于引入CSS样式表或者字体文件等，但是现代浏览器通常支持通过以下两种方式引入JS脚本
```html
<link rel="preload" href="script.js" as="script">
<link rel="prefetch" href="script.js" as="script">
```
`preload`和`prefetch`都是`link`标签的属性，用于提前加载资源。两者的区别在于`preload`会立即加载资源，而`prefetch`会在浏览器空闲时加载资源。

这两种方式可以提前加载资源，但是不会执行脚本。**脚本的执行仍然需要`<script>`标签。**

`preload`的加载是并行加载，不会阻塞文档的解析过程，适用于一些重点资源的加载，如首屏渲染的关键资源。

`prefetch`的加载是在浏览器空闲时加载，不会影响当前页面的加载，适用于一些非关键资源的加载，如未来页面的资源预加载。

## `async`和`defer`
一般情况下，浏览器在解析HTML文档时，遇到[`script`](/docs/frontend/browser/modernWebBrowser#渲染)
标签时会暂停文档解析，加载并执行脚本，然后再继续解析文档。这样会导致页面加载速度变慢，因为脚本的加载和执行是阻塞的。
![文档未解析完成时的async脚本加载](/images/script-load-common.png)
### async
当浏览器遇到带有`async`属性的`script`标签时
```html
<script src="example.js" async></script>
```
会异步加载，不会阻塞文档解析。但是，异步加载的脚本不一定会按照它们在文档中的顺序执行，**而是在加载完成后立即执行**，注意执行过程是会阻塞文档解析的。

如果遇到`async`脚本时文档解析并未结束，具体过程如下图所示
![文档未解析完成时的async脚本加载](/images/script-load-async1.png)

如果遇到`async`脚本时文档解析已经完成，或者脚本异步加载完成时文档解析已完成，则具体过程如下图所示
![文档未解析完成时的async脚本加载](/images/script-load-async2.png)
> [!WARNING]
> 由于`async`脚本的执行时机不确定，所以不要在`async`脚本中使用脚本间互相依赖或者依赖DOM的内容，否则可能会出现问题。

### defer
当浏览器遇到带有`defer`属性的`script`标签时
```html
<script src="example.js" defer></script>
```
会异步加载，不会阻塞文档解析。但是，`defer`脚本会在文档解析完成后按照它们在文档中的顺序执行，**并且在`DOMContentLoaded`事件之前执行**。
![defer脚本加载](/images/script-load-defer.png)

## 总结
| **特性**          | **preload**   | **prefetch**    | **async**         | **defer**      |
|------------------|---------------|-----------------|-------------------|----------------|
| **目的**         | 提前加载关键资源      | 预加载未来可能需要的资源    | 异步加载和执行JavaScript | 异步加载和延迟执行JavaScript |
| **优先级**       | 高优先级加载        | 低优先级加载          | 高优先级加载            | 高优先级加载         |
| **加载时间**     | 脚本加载与文档解析同时进行 | 浏览器空闲时加载        | 脚本加载与文档解析同时进行     | 脚本加载与文档解析同时进行  |
| **执行时间**     | 不执行           | 不执行       | 下载完成后立即执行         | DOM解析完成后再执行    |
| **执行顺序**     | 不执行           | 不执行             | 不保证顺序             | 保证按顺序执行        |
| **典型应用场景** | 字体、样式、关键脚本    | 下一个页面的资源、图片、视频等 | 第三方脚本、广告脚本等       | DOM相关的功能脚本     |
