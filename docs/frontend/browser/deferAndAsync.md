# JS加载中的`defer`和`async`

一般情况下，浏览器在解析HTML文档时，遇到[`script`](/docs/frontend/browser/modernWebBrowser#渲染)
标签时会暂停文档解析，加载并执行脚本，然后再继续解析文档。这样会导致页面加载速度变慢，因为脚本的加载和执行是阻塞的。
![文档未解析完成时的async脚本加载](/images/script-load-common.png)

## async
当浏览器遇到带有`async`属性的`script`标签时
```html
<script src="example.js" async></script>
```
会异步加载，不会阻塞文档解析。但是，异步加载的脚本不一定会按照它们在文档中的顺序执行，**而是在加载完成后立即执行**，注意执行过程是会阻塞文档解析的。

如果遇到`async`脚本时文档解析并未结束，具体过程如下图所示
![文档未解析完成时的async脚本加载](/images/script-load-async1.png)

如果遇到`async`脚本时文档解析已经完成，或者脚本异步加载完成时文档解析已完成，则具体过程如下图所示
![文档未解析完成时的async脚本加载](/images/script-load-async2.png)
> [!NOTE]
> 由于`async`脚本的执行时机不确定，所以不要在`async`脚本中使用脚本间互相依赖或者依赖DOM的内容，否则可能会出现问题。

## defer
当浏览器遇到带有`defer`属性的`script`标签时
```html
<script src="example.js" defer></script>
```
会异步加载，不会阻塞文档解析。但是，`defer`脚本会在文档解析完成后按照它们在文档中的顺序执行，**并且在`DOMContentLoaded`事件之前执行**。
![defer脚本加载](/images/script-load-defer.png)
