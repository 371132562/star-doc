const nav = () => {
  return [
    { text: '前端', link: '/docs/frontend/javascript/typeConversion' },
    { text: '计算机', link: '/docs/computerScience/twosComplement' },
    { text: '数据结构', link: '/docs/dataStructures/arrayAndLinkedList' },
    { text: '网络', link: '/docs/network/connectionManagement' },
    {
      text: '其他',
      items: [{ text: 'Linux', link: '/docs/linux/ubuntuInstallMemo' }]
    }
  ];
};

export default nav;
