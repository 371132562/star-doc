import type { DefaultTheme } from 'vitepress';
import { defineConfig } from 'vitepress';

import language from '../config/language';
import nav from '../config/nav';
import search from '../config/search';
import sideBar from '../config/sidebar';
import viteConfig from '../config/viteConfig';

const base = '/star-doc/';

export default defineConfig({
  vite: viteConfig(),
  base,
  lang: 'zh-CN',
  title: 'Star Doc',
  description: 'Adventure',
  head: [['link', { rel: 'icon', href: base + 'images/logo.png' }]],
  cleanUrls: true, //省略url中的html后缀
  // srcDir: './docs',
  markdown: {
    lineNumbers: true, // 代码块显示行号
    image: {
      lazyLoading: true // 图片懒加载
    },
    math: true
  },
  themeConfig: {
    logo: '/images/logo.png',

    search: search(),

    nav: nav() as DefaultTheme.NavItem[],

    sidebar: sideBar(),

    ...language(),

    editLink: {
      pattern: 'https://github.com/371132562/star-doc/edit/master/:path',
      text: '在 GitHub 上编辑此页面'
    },

    footer: {
      message: '基于 Apache-2.0 许可发布',
      copyright: `Copyright © 2024-${new Date().getFullYear()} Star`
    },

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/371132562/star-doc'
      }
    ]
  }
});
