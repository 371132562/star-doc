const nav = () => {
  return [
    { text: '前端', link: '/docs/frontend/javascript/typeConversion' },
    { text: '计算机', link: '/docs/computerScience/basic/cache' },
    { text: '数据结构', link: '/docs/dataStructures/basic/arrayAndLinkedList' },
    { text: '网络', link: '/docs/network/tcpHandshakesAndWaves' },
    {
      text: '其他',
      items: [{ text: 'Linux', link: '/docs/linux/ubuntuInstallMemo' }]
    }
  ];
};

export default nav;
