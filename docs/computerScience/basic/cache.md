# Cache {#cache}
## 为什么要使用高速缓冲存储器 Cache
首先我们通过下图了解计算机中各个层级的存储设备之间性能，价格以及容量之间的关系

![存储设备层次结构](/images/memory.png)
**<p align="center">存储设备层次结构</p>**

从图中我们可以看到，CPU寄存器是最快的存储设备，并且技术更新换代升级很快，但是容量最小，主存（内存）速度比较慢，技术升级较慢，但是容量比较大。

CPU无论是取指令、取数据或存数据都需要通过主存来完成，而两者之间的速度差距很大，当频繁访问主存时需要等待主存响应，使CPU经常进入空等的状态，导致大量的性能浪费。
这就是著名的 **冯诺依曼瓶颈** 问题。

为了解决这个问题，现代计算机中引入了高速缓存存储器（Cache），一般是基于SRAM，Cache是介于CPU和主存之间的一层高速存储器。
它的容量比主存小，但是速度比主存快，Cache的引入可以减少CPU等待主存的时间，提高CPU的运行效率。
![Cache流程](/images/cacheFlow.png)

::: info NOTE
现代计算机的CPU往往采用三级缓存结构，分别是L1 Cache、L2 Cache和L3 Cache，L1 Cache是最快的，容量最小，L3 Cache是最慢的，容量最大。
:::

## 工作原理
Cache所依赖的核心原理是 **局部性原理**
- 时间局部性：如果一个数据被访问，那么在不久的将来它很可能再次被访问。

  程序在某一时间段内往往集中于处理某些特定的任务或数据，这些任务往往反复需要相同的数据或指令。例如：循环、递归调用、函数调用返回等。

---

- 空间局部性：如果一个数据被访问，那么与它相邻的数据很可能也会被访问。

  程序的数据和指令通常是有组织和连续存储的。这种组织方式决定了程序访问数据时，附近的内存位置也很可能被使用。例如：数组访问，顺序执行指令，类的成员访问等。

符合这些条件的数据在首次通过主存读取时，会被缓存到Cache（Cache存储体）中，CPU再次访问时，会先在Cache中查找，如果找到则直接返回，否则再从主存中读取。

## 工作方式
首先明确两个概念：**缓存命中** 和 **缓存未命中**
- 缓存命中：当处理器需要的数据已经存在于Cache中，处理器可以直接从Cache中读取数据，速度快，延迟小。
- 缓存未命中：当处理器需要的数据不在Cache中，必须从主存中读取数据，处理器等待时间较长。此时，数据会被加载到Cache中，以便未来可能再次访问。

### 映射
由文章开篇的层次结构图可知，Cache的速度比主存快，但是容量比主存小，所以Cache无法缓存所有的数据，需要将主存中的数据根据一定规则映射到Cache中。

缓存机制会把主存和缓存划分为大小相等的块（或者称为行），称为 **Cache块** 和 **主存块**，每次未命中时都会以一个主存块为最小单位，将块中的数据存入Cache块中。

缓存控制器会将主存块的地址信息存入标记当中，用于命中判断。
![Cache块和主存块](/images/cacheLine.png)
**<p align="center">分块示意图</p>**
::: info Cache与主存的映射方式
- **直接映射**：每个主存块只能映射到Cache的一个Cache块中，通过取模运算计算Cache块的索引。优点是查找简单，速度快，但冲突较多，因为多个主存地址可能映射到同一个Cache位置。
- **全相联映射**：每个主存块可以映射到Cache的任意一个Cache块中，通过比较标记来判断是否命中。优点是冲突少，但硬件实现复杂，查找时间较长。
- **组相联映射**：Cache被划分为若干组，每个主存块只能映射到某一组的任意一个Cache块中，通过比较标记和组索引来判断是否命中。折中方案，它平衡了直接映射的速度和全相联映射的灵活性。
:::

---

### 读取Cache
![读取Cache流程图](/images/cacheRead.png)
**<p align="center">读取Cache流程图</p>**
#### 替换策略
在读取过程中如果Cache已满，需要替换一个Cache块，常见的替换策略有：
- **随机替换**：随机选择一个Cache块进行替换。
- **先进先出（FIFO）**：替换最早进入Cache的块。
- **最近最少使用（LRU）**：替换最近最少使用的块。

---

### 写入Cache
当CPU需要将数据写入Cache时，在基于映射方式和替换策略决定写入Cache位置的基础上，还有两种向主存写入的策略
- **写回（Write Back）**：只在Cache中修改数据，不立即写入主存，而是等到Cache块被替换时才写入主存。

  这样可以减少主存写入次数，提高性能，但需要额外的标记位（dirty bit）来跟踪修改状态。
- **写直达（Write Through）**：每次写入Cache都会同时写入主存，保证主存和Cache中的数据一致。

  这样可以保证数据的一致性，但是会增加主存的访问次数，降低性能。

## 性能
### 命中率
根据局部性原理以及工作方式我们可以看出，缓存的 **容量** 和 **块长** 会影响缓存的命中率。
- **容量**：Cache容量越大，可以缓存的数据越多，命中率越高，但相应的硬件成本也会提高。
- **块长**：块长过大，则可划分的总Cache块数就会变少，虽然每块中包含了更多主存数据，但可能会导致大量不符合空间局部性的数据被缓存，从而降低命中率，增加了缓存替换的频率。

  块长过小，空间局部性无法充分利用，因为即使访问了某个主存块中的数据，其相邻的数据可能仍然需要从主存加载，导致缓存命中率不高。

  **一般每块可取4-8个字** （机器字长）。

### 效率
缓存的命中率是衡量Cache性能的重要指标，命中率越高，CPU等待主存的时间就越少，CPU的运行效率就越高。

设Cache命中率为 $h$，访问Cache的时间为 $t_{c}$，访问主存的时间为 $t_{m}$。

则效率 $e$ 可以表示为：

$$
e = { { t_{c} \over h \times t_{c} + (1-h) \times t_{m} } \times 100\% }
$$
<p align="center">（访问Cache的时间/平均访问时间* 100%）</p>

## 关于前端开发
局部性原理以及Cache的工作原理对于前端开发也有一定的意义
- `Array` 在遍历和查找方面速度较快，尤其是顺序遍历，因为数组在内存中是连续的，符合缓存的空间局部性原理。
- `Object` 由于其属性存储位置分散，遍历时间通常会稍长。
- `Linked List` 因为链表的每个节点分布在不同的内存区域，所以遍历性能较低，尤其是在链表长度很大时。
- `Set` 和 `Map` 由于其哈希表的实现，查找时间复杂度较低，但遍历性能往往介于数组和对象之间。
