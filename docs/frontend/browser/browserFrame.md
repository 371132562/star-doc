# 浏览器帧原理
## 什么是浏览器帧
就像电影是由一帧一帧的画面组成，浏览器也是由一帧一帧的页面组成。

在浏览器渲染过程中，每一帧的生成是一个非常复杂且有顺序的过程，涉及多个子步骤。

一般来说浏览器的帧数与显示器的刷新率直接相关，浏览器会尝试以与显示器刷新率相匹配的速度渲染内容，以实现流畅的视觉效果。

常用显示器的刷新率一般为60Hz，即每秒刷新60次。低于此帧数会导致页面卡顿，高于此帧数则会浪费资源。

需要注意的是，实际帧率会受到多种因素的影响。

如果主线程任务阻塞，执行时间过长，或者机器性能不足，都会导致实际帧率下降。

又假如页面元素没有变化（没有动画、没有 `DOM` 操作、没有样式修改），浏览器会跳过帧流程中的某些步骤，直接复用上一帧的结果，以提高性能。
> [!NOTE]
> 会跳过的步骤：`Parse HTML`、`Recalc Styles`、`Layout`、`Paint`。
> 
> 不会跳过的步骤：`Input event handlers`、`JavaScript Execution`、`requestAnimationFrame`、`Composite`。

## 浏览器帧生成过程
![浏览器帧原理](/images/browser-frame.svg)
**<p align="center">浏览器帧原理图示</p>**

图中的流程**并不一定全部执行**，浏览器会根据当前的情况选择执行哪些流程。

例如 如果没有新的 HTML 要解析，那么解析 HTML 的步骤就不会触发。
如果修改 Paint only 属性，即不会影响到页面布局的属性，那么布局步骤就不会触发，但仍执行绘制步骤。
![缩短渲染路径](/images/browser-frame-route.png)

图中 `RecalcStyles` 和 `Layout` 下方指向 `requestAnimationFrame` 的红色箭头，也就是在同一帧内再次回到 `requestAnimationFrame` 是有可能的。
这种现象通常由 强制同步布局（forced synchronous layout） 或 样式计算 引起。
> [!NOTE]
> **强制同步布局** 是指 JavaScript 代码在帧渲染过程中显式或隐式地读取了布局信息
> （如 `offsetWidth`、`offsetHeight`、`clientWidth`、`clientHeight`、`getBoundingClientRect()` 等）。
> 当你访问这些属性时，浏览器必须确保返回的值是最新的布局结果。
> ```js
> requestAnimationFrame(() => {
>    element.style.width = '200px';  // 修改 DOM 样式，标记为需要布局
>    console.log(element.offsetWidth);  // 强制同步读取布局信息
> });
> ```
> 在 `requestAnimationFrame` 中读取布局信息，浏览器会被迫执行一次布局计算，如果你在同一帧内频繁修改样式并读取相关属性，浏览器可能多次触发 `RecalcStyles` 和 `Layout`。
> 不利于性能优化，应尽量避免强制同步布局。

### 帧开始

### 输入事件的处理（Input event handlers）
浏览器首先会处理用户输入事件（如点击、滚动、键盘输入等）。这些事件可能会导致页面的状态变化。在这一阶段，浏览器将根据用户输入调用相应的事件处理回调。

### JS 执行（JavaScript Execution）
依照 [事件循环机制](../javascript/eventLoop) 的规则，浏览器会执行 JavaScript 代码。这可能是由用户输入事件触发的事件处理程序，也可能是由定时器、网络请求等触发的异步任务。

如果栈和所有任务队列都为空，浏览器将有机会继续执行下一步的渲染操作。
> [!WARNING]
> 如果在一帧内执行了耗时的操作（例如阻塞的计算任务），会导致浏览器无法在 16.67 毫秒（60帧的前提下）内完成渲染，从而造成页面显示卡顿。

### [`requestAnimationFrame`](../javascript/rAFAndrICB#requestAnimationFrame)
这是浏览器提供的一个 API，用于在下一帧绘制之前执行回调函数。这里是动画和改变 `DOM` 的良好执行时机，它与浏览器的刷新频率同步，在此处可以获取最新的输入数据。

浏览器会在每一帧的开始阶段调用通过 `requestAnimationFrame` 注册的回调函数，让开发者可以在下一次绘制之前更新动画状态，避免不必要的重绘和重排。

### 解析 HTML（Parse HTML）
处理新添加的 HTML，创建 `DOM` 元素。在页面加载过程中，或者进行 `appendChild` 操作后，你可能看到更多的此过程发生。

### 重新计算样式（Recalc Styles）
浏览器会在 JavaScript 执行和 `requestAnimationFrame` 处理之后，根据 `DOM` 树的状态和 `CSS` 规则重新计算元素的样式，生成新的渲染树。

重新计算的范围可能是整个文档，也可能是局部的一部分。这取决于哪些元素的样式发生了变化。

### 布局（Layout）
布局是指浏览器根据渲染树计算每个元素的位置和大小，生成布局树。布局是一个非常昂贵的操作，因为它需要考虑到元素之间的相互影响。

如果 `DOM` 中有任何元素发生了尺寸或位置变化（如添加新元素、调整元素尺寸等），浏览器会重新进行布局（重排）。

### 绘制（Paint）
在布局之后，浏览器开始绘制页面的可视内容，将元素的文本、边框、背景等绘制到不同的绘制层（Paint Layers）中。这个过程是将元素的几何信息转换为像素信息的过程。

浏览器对此做了优化，针对需要更新的绘制层进行增量绘制，而不是每次都重新绘制整个页面。

### 合成（Composite）
浏览器将页面分割为多个合成层（Composite Layers），每个合成层都是一个独立的位图，可以独立地进行合成和绘制。

这个过程实际上包括了栅格化规划（Raster Scheduled）和栅格化（Rasterize）两个步骤，并且调用了GPU进行合成处理。

### 发送帧
图块被上传到GPU。GPU 使用四边形和矩阵（所有常用的 GL 数据类型）将图块 draw 在屏幕上。

### 帧结束
### [`requestIdleCallback`](../javascript/rAFAndrICB#requestIdleCallback)
是浏览器用于在“**空闲时间**”执行任务的 API。它允许你每一帧结束并且距离下一帧开始仍然有空闲时间时执行**非关键任务**，不会阻塞关键的渲染过程。

这通常用于执行那些不需要立即执行、但可能会影响用户体验的任务，比如日志处理、分析数据、预加载资源等。
由于这个 API 只有在浏览器渲染流程中有空余时间时才执行，所以它不保证会在每一帧都被调用。
