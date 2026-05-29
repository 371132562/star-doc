---
name: star-doc-verification
description: 在 star-doc 项目中完成 Markdown、图片、导航或 VitePress 配置修改后使用；用于检查链接、图片路径、代码块语言、标题层级、VitePress callout 和必要的轻量命令验证。
---

# star-doc 文档验证规范

用于在交付前检查文档站修改是否可靠。验证范围按改动风险收敛，不默认运行 dev/build/install，除非用户明确要求。

## 静态检查清单

### Markdown 内容

- 每篇文章只有一个一级标题 `#`。
- 标题层级不跳级。
- 代码块带语言标识。
- 示例代码和输出结果一致。
- VitePress callout 写法正确，例如 `> [!NOTE]`、`> [!WARNING]`。
- 表格、列表、引用块前后留有必要空行，避免渲染粘连。

### 链接

- 站内链接指向真实存在的文档或锚点。
- 同目录相对链接在移动文件后仍然正确。
- `config/sidebar.ts` 和 `config/nav.ts` 中的链接不带 `.md`，并指向存在的 `docs` 文件。
- 外链如来自官方文档或规范，链接文本应说明来源。

### 图片

- 图片文件存在于 `public/images/`。
- Markdown 使用 `/images/xxx` 引用。
- 图片 alt 文本能说明图片内容。
- 不新增中文、空格或难维护的图片文件名。

### 配置

- `config/sidebar.ts` 保持对象结构、数组结构和默认导出。
- `config/nav.ts` 保持数组结构和默认导出。
- 修改 `index.md` frontmatter 时，缩进和字段层级必须合法。

## 推荐命令

仅在用户未禁止校验命令，且任务确实需要时运行：

```bash
pnpm exec prettier --check .
```

修改配置文件或较大范围文档后，可在用户允许时运行：

```bash
pnpm exec vitepress build
```

不要自动运行 `pnpm install`。如果依赖缺失导致命令失败，直接说明原因并停止，不擅自安装。

## targeted search 建议

- 检查旧路径残留：`rg "旧文件名|旧路径" .`
- 检查图片引用：`rg "/images/" docs index.md`
- 检查 sidebar/nav 链接：`rg "link:" config`
- 检查未标语言代码块：
  ```text
  rg '^```$' docs index.md
  ```

## 交付说明

交付时说明：

- 修改了哪些文章或配置。
- 做了哪些静态检查或命令验证。
- 如果未运行命令，说明原因，例如用户未要求、任务仅文案改动、项目禁止自动 build/dev/install。
