const language = () => {
  return {
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    outline: {
      level: [2, 3] as [number, number],
      label: '页面导航'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short' as const,
        timeStyle: 'medium' as const
      }
    },

    langMenuLabel: '多语言',
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式'
  };
};

export default language;
