# IntersectionObserver
`IntersectionObserver` 是一种用于检测元素与其祖先或顶级文档视口之间的交叉状态的 API。
可以在元素进入或离开视口时触发回调函数。

它是一种方便且简化的手段，使得开发者能够更高效地处理懒加载、无限滚动、曝光统计等场景，而不必手动监听滚动或 `resize` 事件并计算高度、宽度等信息。
::: tip
该 API 注册的回调函数是异步执行的，会将其加入(宏)任务队列，不会阻塞主线程。
:::

## 语法
```js
// 创建一个 IntersectionObserver 实例
const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('元素进入视口');
    } else {
      console.log('元素离开视口');
    }
  });
}, {
  root: null,         // 计算交叉部分时作为边界的根元素，未传入或传入 null 时默认为顶级文档的视口。
  rootMargin: '0px',  // 计算交叉部分时添加到边界盒的矩形偏移量，默认为 '0px'。
  threshold: 0      // 计算交叉部分时触发回调函数的交叉比例阈值，可以为单个数值或数值数组。
                    // 默认为 0，也就是说当目标元素任何部分进入或离开视口时，回调函数都会触发。
});

// 观察目标元素
const targetElement = document.querySelector('.target');
observer.observe(targetElement);

// 停止观察目标元素
observer.unobserve(targetElement);

// 停止观察所有目标元素
observer.disconnect();

// takeRecords 方法返回一个包含所有未处理的 IntersectionObserverEntry 对象的数组
// 表示目标元素的当前交叉状态。通常用于在回调函数之前立即获取交叉状态，避免遗漏状态。
const entries = observer.takeRecords();
entries.forEach(entry => {
  console.log(entry.isIntersecting ? '当前可见' : '当前不可见');
});

```

### 配置项
`threshold` 很好理解，它是一个数值或数值数组，表示交叉部分所占比例。下边我们来演示一下另外两个配置项 `root` 和 `rootMargin`。

```vue
<script setup>
  const toast = useToast();
  onMounted(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          toast.add({ title: `目标元素进入` });
        } else {
          toast.add({ title: `目标元素离开` });
        }
      },
      {
        root: document.getElementById('scrollContainer'), // 使用自定义容器作为 root
        rootMargin: '100px 0px' // 扩展视口区域，在顶部额外增加 100px
      }
    );

    observer.observe(document.querySelector('.target'));
  });
</script>

<template>
  <div
    id="scrollContainer"
    style="height: 300px; overflow: auto; border: 1px solid white"
  >
    <UNotifications />
    <div style="height: 600px">
      <div
        class="target"
        style="margin-top: 400px; height: 100px; background-color: lightblue"
      >
        目标元素
      </div>
    </div>
  </div>
</template>
```
在这个例子中，我们将 `root` 设置为一个特定的容器 `#scrollContainer`，而不是默认的视口。这意味着目标元素的可见性是相对于这个容器来检测的。

使用 `rootMargin` 来调整 `root` 的检测区域。
例如，如果你想在目标元素距离 `root` 还有一段距离时就开始加载（如懒加载图片），可以通过设置 `rootMargin` 来扩大视口的检测区域。

## 应用场景
- 懒加载：当图片进入视口时再加载图片
- 无限滚动：当滚动到底部时加载更多数据
- 曝光统计：统计广告曝光次数
- 滚动动画：当元素进入视口时播放动画
