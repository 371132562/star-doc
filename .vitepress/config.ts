import { defineConfig } from 'vitepress';

import language from './config/language';
import nav from './config/nav';
import search from './config/search';
import sideBar from './config/sidebar';
import viteConfig from './config/vite.config';

export default defineConfig({
  vite: viteConfig(),

  base: '/star-doc/',
  lang: 'zh-CN',
  title: 'Star Doc',
  description: 'Adventure',
  head: [['link', { rel: 'icon', href: '/images/logo.png' }]],
  cleanUrls: true, //省略url中的html后缀
  // srcDir: './docs',
  markdown: {
    lineNumbers: true, // 代码块显示行号
    image: {
      lazyLoading: true // 图片懒加载
    }
  },
  themeConfig: {
    logo: '/images/logo.png',

    search: search(),

    nav: nav(),

    sidebar: sideBar(),

    ...language(),

    // editLink: {
    //   pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
    //   text: '在 GitHub 上编辑此页面'
    // },

    // footer: {
    //   message: '基于 MIT 许可发布',
    //   copyright: `版权所有 © 2019-${new Date().getFullYear()} 尤雨溪`
    // },

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/371132562/star-adventure/tree/master/apps/web-doc'
      }
    ]
  }
});
