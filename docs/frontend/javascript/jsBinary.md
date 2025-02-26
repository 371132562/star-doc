# JS二进制
在 Javascript 中有一系列用来处理文件或者类文件对象二进制数据的 API。它们各自具有不同的用途，但可以相互配合完成各种文件和数据的读取、操作和传输。

通过下图可以快速了解这些这些对象和 API 之间的关系。
![JS二进制](/images/jsBinary.png)

## `Blob`
`Blob` 是一种表示不可变的、原始数据的类文件对象。它不一定是文件，但它可以保存文件数据，并且包含原始的二进制数据，适合用于传输。

### 基本语法
`Blob` 对象可以通过 `Blob()` 构造函数创建
```js
new Blob(parts, options)
```
**`parts`**: 一个数组，包含数据片段，可以是字符串、`ArrayBuffer`、`TypedArray`、其他 `Blob` 等。

**`options`**: 一个包含配置项的对象。
- `type`: [MIME 类型](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types)，例如 "text/plain"、"image/png"。
- `endings`: 控制换行符，默认为 `transparent`，或者是 `native`，用于指定包含行结束符 `\n` 的字符串如何被写入，不常用。

### 实例属性
```js
// 创建包含文本的 Blob
const blob = new Blob(["Hello, World!"], { type: "text/plain" });

console.log(blob.size); // 输出 Blob 大小，单位为字节
console.log(blob.type); // 输出 "text/plain"
```

### 实例方法

#### `text()`
以 `json` 字符串使用 `Blob` 进行保存为例，具体的二进制数据是何种模样我们无需关心，使用该 API 读取后即可得到原始的 `json` 字符串，后以我们熟悉的方式进行处理和使用。
```js
const blob = new Blob([JSON.stringify({ name: "Alice", age: 25 })], { type: "application/json" });

blob.text().then(text => {
  const data = JSON.parse(text); // 将 JSON 字符串解析为对象
  console.log(data.name); // 输出 "Alice"
});
```

#### `slice()`
该方法用于创建新的 `Blob`，表示原始 `Blob` 的子集。

以读取视频文件的部分内容进行预览为例（例如视频的前几秒）。
```js
const videoBlob = new Blob([/* 视频二进制数据 */], { type: "video/mp4" });
const previewBlob = videoBlob.slice(0, 1048576, "video/mp4"); // 提取前 1 MB 的数据

const url = URL.createObjectURL(previewBlob);
const video = document.createElement("video");
video.src = url;
video.controls = true;
document.body.appendChild(video);

// 释放 URL
video.addEventListener("ended", () => {
  URL.revokeObjectURL(url);
});
```

#### `arrayBuffer()`
`Blob` 不支持直接操作其内容，但可以通过 `arrayBuffer()` 方法将其转换为 `ArrayBuffer` 对象，然后借助 `TypedArray` 或 `DataView` 视图来访问和操作其内容。
```js
const imageBlob = new Blob([/* binary data */], { type: "image/png" });

imageBlob.arrayBuffer().then(buffer => {
  const uint8Array = new Uint8Array(buffer);
  // 假设对图像数据进行简单操作，例如将每个字节取反（简单示例）
  for (let i = 0; i < uint8Array.length; i++) {
    uint8Array[i] = 255 - uint8Array[i];
  }
  // 使用修改后的二进制数据继续处理
  // ......
});
```

#### `stream()`
方法返回一个 [`ReadableStream`](https://developer.mozilla.org/zh-CN/docs/Web/API/ReadableStream) 对象，可以用于逐步读取 `Blob` 的内容。
这对于需要逐步处理大量数据的情况特别有用。

## `File`
`File` 是 `Blob` 的子类，是 JavaScript 中用于处理文件数据的对象，除包含了 `Blob` 的大部分功能和方法的同时包含了一些特定的文件元信息（例如文件名`name`和最后修改时间`lastModified`）。

`File` 对象的典型来源是用户上传的文件，例如通过文件选择器（`<input type="file">`）或拖放方式选择文件。很少用于生成虚拟文件。

### 基本语法
通过文件选择器获取 `File` 对象，假设页面上目前有一个`<input type="file" id="fileInput">`
```js
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0]; // 获取第一个选择的文件
  if (file) {
    console.log("File name:", file.name);      // 输出文件名
    console.log("File size:", file.size);      // 输出文件大小
    console.log("File type:", file.type);      // 输出文件类型
    console.log("File lastModified:", file.lastModified);  // 输出最后修改时间戳（通常是当前时间）

    const text = await file.text(); // 读取文件内容
    console.log("File content:", text); // 输出文本内容
  }
});
```

### 实例属性
```js
// 父类Blob的属性
console.log(file.size); // 输出 File 大小，单位为字节
console.log(file.type); // 输出文件的类型

// 除了继承自Blob的属性之外，File对象还有以下属性
console.log(file.name); // 输出文件名
console.log(file.lastModified); // 输出最后修改的时间戳
```

### 实例方法
继承 [`Blob`](./jsBinary#实例方法)，使用方法一致，不再赘述。

## `Blob` 和 `File` 的有关 API
此处列出一些虽不是 `Blob` 或 `File` 对象的方法，但与它们有关的 API。

### `URL.createObjectURL()` & `URL.revokeObjectURL()`
`URL.createObjectURL()` 方法用于将 `Blob` 或 `File` 对象转为一个临时的、本地可访问的 `URL`。

其生成一个字符串形式的 `URL`（例如 `blob:<origin>/<uuid>`），这个 `URL` 可以直接用作图片、视频、音频或其他资源的 `src`。

例如，当需要在前端快速预览用户上传的文件时（如图片、视频等），可以创建一个 `URL` 赋值给媒体元素。
```js
// HTML: 
// <input type="file" id="fileInput"> 
// <img id="previewImage">

const fileInput = document.getElementById("fileInput");
const previewImage = document.getElementById("previewImage");

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    const objectURL = URL.createObjectURL(file);
    previewImage.src = objectURL; // 使用 URL 作为图片的 src
  }
});
```

由于 `URL.createObjectURL()` 创建的 `URL` 占用浏览器内存，长期存在的临时 `URL` 可能导致内存泄漏。
因此在文件加载完成或不再需要时，使用 `URL.revokeObjectURL()` 手动释放内存。
```js
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    const objectURL = URL.createObjectURL(file);
    previewImage.src = objectURL;
    
    // 在图片加载完成后释放 URL
    previewImage.onload = () => {
      URL.revokeObjectURL(objectURL);
    };
  }
});
```

### `FileReader`
`FileReader` 是一种更通用的异步文件读取方式，能够将 `File` 或 `Blob` 对象转换为不同的形式（如文本、`ArrayBuffer`、`Data URL` 等）。
适用于需要对文件数据进行进一步处理或读取文件内容的场景。

#### 实例属性
- `readyState`: 表示读取操作的状态，有以下几种状态：
  - `EMPTY`: 未加载任何数据，值为 0。
  - `LOADING`: 正在加载数据，值为 1。
  - `DONE`: 加载完成，值为 2。
- `result`: 读取操作完成后的结果，类型取决于所调用的读取操作的类型。
- `error`: 读取操作失败时的错误信息。

---

#### 事件
- `loadstart`: 开始读取文件时触发。
- `progress`: 读取文件过程中定期触发。
- `load`: 读取完成时触发。
- `error`: 读取失败时触发。
- `loadend`: 读取完成或失败时触发。
- `abort`: 读取被中止时触发。

以上事件均可以通过两种方式来完成回调的触发
```js
const reader = new FileReader();

// 1.使用 onload 直接绑定回调函数
reader.onload = () => {
  console.log("File read successful");
};

// 2.使用 addEventListener 监听
reader.addEventListener("load", () => {
  console.log("File read successful");
});
```

---

#### 实例方法

**`readAsText()`**

将 `Blob` 或 `File` 对象的内容读取为文本字符串。可以指定编码，默认为 `UTF-8`。适用于读取 `.txt`、`.json` 等文本文件。
```js
// HTML: 
// <input type="file" id="fileInput"> 

const fileInput = document.querySelector("#fileInput");
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  
  reader.onload = () => {
    console.log(reader.result); // 输出文件内容
  };
  reader.readAsText(file, "UTF-8"); // 读取为文本
});
```

---

**`readAsDataURL()`**

将 `Blob` 或 `File` 对象的内容读取为 `Base64` 编码的 `Data URL`，通常用于预览图像。
```js
// HTML: 
// <input type="file" id="fileInput"> 
// <img id="previewImage">

const fileInput = document.querySelector("#fileInput");
const previewImage = document.querySelector("#previewImage");

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  
  reader.onload = () => {
    previewImage.src = reader.result; // 将 Data URL 赋值给 src
  };
  reader.readAsDataURL(file); // 读取为 Data URL
});
```

---

**`readAsArrayBuffer()`**

将 `Blob` 或 `File` 对象的内容读取为 `ArrayBuffer` 对象，适用于处理二进制数据。
```js
// HTML: 
// <input type="file" id="fileInput"> 

const fileInput = document.querySelector("#fileInput");

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = () => {
    const arrayBuffer = reader.result;
    console.log(arrayBuffer); // 输出 ArrayBuffer
  };
  reader.readAsArrayBuffer(file); // 读取为 ArrayBuffer
});
```

---

**`abort()`**

中止当前的读取操作。如果不再需要文件数据时可以调用此方法来取消操作。
```js
const fileInput = document.querySelector("#fileInput");

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = () => {
    console.log("文件读取完成");
  };

  reader.onabort = () => {
    console.log("文件读取已被中止");
  };

  reader.readAsText(file);

  // 模拟用户取消操作
  setTimeout(() => {
    reader.abort(); // 中止读取
  }, 100); // 在100毫秒后中止读取
});
```

## `ArrayBuffer`
`ArrayBuffer` 对象是 JavaScript 中用于表示固定长度的、原始二进制数据的对象。其本身不能直接操作和修改其内容，但可以通过 [`TypedArray`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)
或 [`DataView`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/DataView)
视图对象来访问和操作其内容。 （如需修改 `Blob` 则需要将其转换为 `ArrayBuffer` 即可操作）

它是处理复杂二进制数据的关键工具，通过与视图对象结合使用，它能够在前端 JavaScript 中灵活处理各种二进制数据。

### 基本语法
`ArrayBuffer()` 构造函数包括两个参数，一个是字节长度 `length`，另一个是可选的 `options` 对象。
```js
const buffer = new ArrayBuffer(16, { resizable: true, maxByteLength: 128 });
console.log(buffer.byteLength);    // 输出: 16
console.log(buffer.resizable);     // 输出: true
console.log(buffer.maxByteLength); // 输出: 128

// 调整大小，不超过 maxByteLength
buffer.resize(64);
console.log(buffer.byteLength);    // 输出: 64

// 如果调整大小超过 maxByteLength，会抛出错误
try {
  buffer.resize(256);
} catch (error) {
  console.error("Error resizing:", error.message); // 输出错误信息
}
```
`options` 包含两个配置项
- `resizable`: 是否可调整大小，默认为 `false`。
- `maxByteLength`: 可调整大小的最大字节长度，仅在 `resizable` 为 `true` 时可设置该值，默认为初始 `length` 的值。
当使用实例方法 `resize()` 调整大小时，如果超过该值会抛出错误。

### 静态方法
创建 `ArrayBuffer` 后，通常会使用 `TypedArray` 或 `DataView` 视图对象来操作其内容，通过静态方法 `isView()` 可以判断某个对象是否是基于 `ArrayBuffer` 的视图对象。
```js
const buffer = new ArrayBuffer(16);
const uint8View = new Uint8Array(buffer);

console.log(ArrayBuffer.isView(uint8View)); // 输出: true
console.log(ArrayBuffer.isView(buffer));    // 输出: false
```

### 实例属性
- `byteLength`: 返回 `ArrayBuffer` 对象的当前字节长度。
- `resizable`: 返回 `ArrayBuffer` 对象是否可调整大小。
- `maxByteLength`: 返回 `ArrayBuffer` 对象的最大字节长度，仅在 `resizable` 为 `true` 时实际起效。
- `detached`: 表示 `ArrayBuffer` 是否已被分离。当调用 `transfer()` 方法后，此时 `detached` 值会变为 `true`。

### 实例方法
#### `slice()`
方法用于从现有的 `ArrayBuffer` 中截取一段字节数据，并返回新的 `ArrayBuffer` 子片段。
```js
const buffer = new ArrayBuffer(16);
const slicedBuffer = buffer.slice(4, 8);
console.log(slicedBuffer.byteLength); // 输出: 4
```

#### `resize()`
若初始参数中设置了 `resizable` 为 `true`，则可以使用 `resize()` 方法调整 `ArrayBuffer` 的大小，但不能超过 `maxByteLength`。
```js
const buffer = new ArrayBuffer(16, { resizable: true, maxByteLength: 64 });
console.log(buffer.byteLength); // 输出: 16

buffer.resize(32);
console.log(buffer.byteLength); // 输出: 32

buffer.resize(128); 
// 输出: ArrayBuffer.prototype.resize: Invalid length parameter
```

#### `transfer()`
当你需要对缓冲区进行扩展、缩小或重分配的情况下，可以使用 `transfer()` 方法将原始数据转移给新的 `ArrayBuffer` 对象。
```js
// 假设需要增加容量
let buffer = new ArrayBuffer(1024);
buffer = buffer.transfer(2048); // 将缓冲区大小增加到 2048 字节

// 假设需要减少容量
let buffer = new ArrayBuffer(4096);
buffer = buffer.transfer(1024); // 缩小为 1024 字节，仅保留实际需要的大小
```
入参为可选参数 `newByteLength`，默认值为原始 `ArrayBuffer` 的大小。

新 `ArrayBuffer` 会继承原始数据的 `options` 配置，所以如果原始数据是可调整大小的，**`newByteLength` 一定不能大于其 `maxByteLength`**。

另外，缩减时溢出的字节被丢弃，扩充时新增的字节被填充为 `0`。

注意，调用 `transfer()` 后，原始 `ArrayBuffer` 会被分离，`detached` 属性会变为 `true`，不再可用，`byteLength` 会变为 `0`。
```js
// 创建一个 resizable 的 ArrayBuffer
const buffer = new ArrayBuffer(16, { resizable: true, maxByteLength: 64 });
console.log(buffer.byteLength);    // 输出: 16
console.log(buffer.detached);      // 输出: false

// 使用 transfer 生成一个新 ArrayBuffer
const newBuffer = buffer.transfer(32);
console.log(buffer.byteLength);    // 输出: 0 （原始 ArrayBuffer 已分离）
console.log(buffer.detached);      // 输出: true （原始 ArrayBuffer 已分离）

// 新的 ArrayBuffer
console.log(newBuffer.byteLength); // 输出: 32
console.log(newBuffer.resizable);  // 输出: true （继承 resizable 属性）
console.log(newBuffer.maxByteLength); // 输出: 64 （继承 maxByteLength 属性）

// 尝试对已分离的 ArrayBuffer 再次调用 transfer 会报错
try {
  buffer.transfer(16);
} catch (error) {
  console.error("Error:", error.message); // 输出错误信息
}
```

#### `transferToFixedLength()`
该方法与 `transfer()` 的功能类似，唯一的区别在于它总是创建一个不可调整大小的 `ArrayBuffer`。
```js
const buffer = new ArrayBuffer(16, { resizable: true, maxByteLength: 64 });
const fixedBuffer = buffer.transferToFixedLength();
console.log(fixedBuffer.resizable); // 输出: false
```
入参为可选参数 `newByteLength`，默认值为原始 `ArrayBuffer` 的大小。

由于新的 `ArrayBuffer` 是固定大小，**所以允许传入的 `newByteLength` 大于原始 `ArrayBuffer` 的 `maxByteLength`**。
```js
const buffer = new ArrayBuffer(8, { resizable: true, maxByteLength: 16 });

const buffer21= buffer.transferToFixedLength(32);
console.log(buffer1.byteLength); // 32
console.log(buffer1.resizable); // false
```

## `TypedArray`
是一种用来处理原始二进制数据的类数组视图，提供了对内存中固定大小的数据块进行高效的访问，特别适合在处理文件、音视频、图像等大数据量、二进制数据的场景中。

通过它我们可以操作 `ArrayBuffer` 对象中的数据，以及对数据进行读取、修改、转换等操作。

注意，Javascript 中并不存在名为 `TypedArray` 的构造函数，而是一系列的构造函数，如 `Int8Array`、`Uint8Array`、`Int16Array` 等 11 个，它们都是 `TypedArray` 的子类。
- Int8Array：8 位有符号整数，元素范围为 -128 到 127。
- Uint8Array：8 位无符号整数，元素范围为 0 到 255。
- Uint8ClampedArray：8 位无符号整数，值在 0 到 255 之间的值被“夹取”，适用于图像数据。
- Int16Array：16 位有符号整数，元素范围为 -32768 到 32767。
- Uint16Array：16 位无符号整数，元素范围为 0 到 65535。
- Int32Array：32 位有符号整数，元素范围为 -2147483648 到 2147483647。
- Uint32Array：32 位无符号整数，元素范围为 0 到 4294967295。
- Float32Array：32 位 IEEE 浮点数，元素范围为 -3.4E38 到 3.4E38。
- Float64Array：64 位 IEEE 浮点数，元素范围为 -1.8E308 到 1.8E308。
- BigInt64Array：64 位有符号整数，元素范围为 -2^63 到 2^63 - 1。（需要支持 BigInt 的环境）
- BigUint64Array：64 位无符号整数，元素范围为 0 到 2^64 - 1。（需要支持 BigInt 的环境）

### 基本语法
通过简单示例列出 `TypedArray` 的创建方式
```js
new TypedArray(length)
new TypedArray(typedArray)
new TypedArray(object)

new TypedArray(buffer)
new TypedArray(buffer, byteOffset)
new TypedArray(buffer, byteOffset, length)
```

传入一个整数 `length`，表示创建一个指定长度的 `TypedArray`。数组的元素会根据所选的 `TypedArray` 类型自动初始化为默认值 `0`。
```js
let int8Array = new Int8Array(4); // 创建一个包含 4 个元素的 Int8Array
console.log(int8Array); // 输出 Int8Array(4) [0, 0, 0, 0]
```

传入另一个 `TypedArray`，会创建一个与传入的 `TypedArray` 类型和长度相同的新 `TypedArray`，并拷贝数据。新的数组内容将根据目标 `TypedArray` 的类型限制进行转换（如有需要）。
```js
let uint8Array = new Uint8Array([1, 2, 3, 256]); // 256 超出 8 位范围
let int16Array = new Int16Array(uint8Array); // 创建一个新的 Int16Array

// 在这个例子中，256 超出了 Uint8Array 的 8 位无符号整数范围，因此被截断为 0。
console.log(int16Array); // 输出 Int16Array(4) [1, 2, 3, 0]
```

传入一个普通数组或类数组对象，`TypedArray` 会根据指定的类型对数据进行转换和初始化。这些值可能会被截断或转换以适应目标 `TypedArray` 的类型。
```js
let float32Array = new Float32Array([1.5, 2.8, 3.9]);
let int32Array = new Int32Array(float32Array); // 转换为整数
console.log(int32Array); // 输出 Int32Array(3) [1, 2, 3]
```

传入一个 `ArrayBuffer` 以及可选的字节偏移量 `byteOffset` 和长度 `length`。
`TypedArray` 会从指定的 `ArrayBuffer` 位置开始创建视图。如果 `byteOffset` 或 `length` 不符合对齐要求或超出 `buffer` 范围，则会抛出错误。

`TypedArray(buffer [, byteOffset [, length]])`
```js
let buffer = new ArrayBuffer(16);

// 从偏移量 4 开始，包含 2 个 32 位整数
let int32View = new Int32Array(buffer, 4, 2); 

console.log(int32View.length); // 输出 2
```
::: info NOTE
当填充元素超出了对应 `TypedArray` 的数值范围时，会被截断，这个过程类似于补码中的越界后的取模操作。
:::

## `DataView`
