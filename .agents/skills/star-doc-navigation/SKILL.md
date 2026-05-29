---
name: star-doc-navigation
description: 在 star-doc 项目中新增、移动、删除 Markdown 文档，调整 docs 目录归类，或修改 config/sidebar.ts、config/nav.ts、首页入口时使用；重点约束 VitePress 路径、导航同步、图片和站内链接维护。
---

# star-doc 导航与目录维护规范

用于维护 `star-doc` 的文档目录、侧边栏、顶部导航和首页入口。核心目标是让文章能被读者稳定找到，且路径和分类可长期维护。

## 项目路径约定

- 前端 JavaScript：`docs/frontend/javascript/`
- 前端浏览器：`docs/frontend/browser/`
- 前端工程化：`docs/frontend/engineering/`
- React：`docs/frontend/react/`
- 计算机基础：`docs/computerScience/basic/`
- 数据结构基础：`docs/dataStructures/basic/`
- 数据结构其他：`docs/dataStructures/others/`
- 网络：`docs/network/`
- Linux：`docs/linux/`
- 图片资源：`public/images/`，文章中以 `/images/xxx` 引用。

新增分类前，先确认现有分类无法承载该主题；不要为了单篇文章新增过细目录。

## 新增文章流程

1. 根据主题选择最贴近的 `docs/` 子目录。
2. 文件名使用英文小驼峰或语义化英文，不使用中文、空格和特殊符号。
3. 文章完成后，更新 `config/sidebar.ts` 中对应分组的 `items`。
4. 如果该文章应作为频道入口或新频道入口，再评估 `config/nav.ts` 或 `index.md`。
5. 检查新增链接是否省略 `.md`，保持现有 VitePress 链接风格。

## 移动或重命名文章流程

1. 先用 `rg` 搜索旧路径、旧文件名和旧标题，找到所有引用。
2. 同步更新：
   - `config/sidebar.ts`
   - `config/nav.ts`
   - `index.md` 中的入口链接
   - 其他 Markdown 文章中的相对链接
3. 检查文章内部相对链接是否因目录层级变化而失效。
4. 若涉及图片移动或重命名，更新所有 `/images/xxx` 引用。

## 删除文章流程

删除文章属于破坏性变更，必须先得到用户明确确认。

确认后执行：

1. 搜索文章路径和标题引用。
2. 删除 sidebar/nav/index 中入口。
3. 处理其他文章中的链接，不能留下死链。
4. 图片只在确认没有其他文章引用后才能删除。

## sidebar.ts 维护规则

- 保持当前函数导出风格：`const sideBar = () => { return { ... }; }; export default sideBar;`。
- 新增条目格式保持现有写法：`{ text: '标题', link: '/docs/...' }`。
- `text` 使用面向读者的中文标题。
- `link` 使用以 `/docs/` 开头的路径，不带 `.md`。
- 同一分组内顺序应符合学习路径：基础概念在前，进阶机制在后，实践/专题靠后。

## nav.ts 维护规则

- 顶部导航只放一级频道或高频入口，不为每篇文章新增 nav。
- 新频道必须有足够内容支撑；单篇文章优先挂在已有频道 sidebar。
- `link` 应指向该频道最适合作为起点的文章。

## 首页维护规则

- 首页只放站点定位、主要频道和稳定入口。
- 不把临时文章、草稿、短期专题放到首页。
- 修改首页图片或外链时，检查 `public/images/` 资源和目标地址是否有效。

## 交付前自查

- 新文章是否能从 sidebar 访问。
- nav 是否仍指向存在的文档。
- 移动/重命名后是否没有旧路径残留。
- 图片路径是否仍以 `/images/` 正确引用。
- 配置文件语法是否保持有效。
