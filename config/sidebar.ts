const sideBar = () => {
  return {
    '/docs/frontend': [
      {
        text: 'JS',
        items: [
          { text: '类型转换', link: '/docs/frontend/javascript/typeConversion' },
          { text: 'valueOf和toString', link: '/docs/frontend/javascript/valueOfAndToString' },
          { text: '短路逻辑', link: '/docs/frontend/javascript/shortCircuitLogic' },
          { text: '标签语句', link: '/docs/frontend/javascript/labelStatement' },
          { text: '原型和原型链', link: '/docs/frontend/javascript/prototype' },
          {
            text: '执行上下文、调用栈与作用域',
            link: '/docs/frontend/javascript/jsExecutionFlow'
          },
          { text: '闭包', link: '/docs/frontend/javascript/closure' },
          { text: '事件循环', link: '/docs/frontend/javascript/eventLoop' },
          { text: 'Promise的使用和执行过程', link: '/docs/frontend/javascript/promiseExecution' },
          { text: 'async&await', link: '/docs/frontend/javascript/asyncAndAwait' },
          { text: 'rAF和rICB', link: '/docs/frontend/javascript/rAFAndrICB' },
          { text: 'Worker', link: '/docs/frontend/javascript/worker' },
          { text: 'Background Sync API', link: '/docs/frontend/javascript/backgroundSyncAPI' },
          {
            text: 'IntersectionObserver API',
            link: '/docs/frontend/javascript/intersectionObserver'
          },
          {
            text: 'MutationObserver API',
            link: '/docs/frontend/javascript/mutationObserver'
          },
          {
            text: 'JS二进制',
            link: '/docs/frontend/javascript/jsBinary'
          }
        ],

        collapsed: false
      },
      {
        text: 'CSS',
        items: [],
        collapsed: false
      },
      {
        text: '工程化',
        items: [{ text: 'Javascript模块', link: '/docs/frontend/engineering/javascriptModules' }],
        collapsed: false
      },
      {
        text: '浏览器',
        items: [
          { text: '深入了解现代网络浏览器', link: '/docs/frontend/browser/modernWebBrowser' },
          { text: '外部资源引入优化', link: '/docs/frontend/browser/optimizeExternalResources' },
          { text: '预加载扫描器', link: '/docs/frontend/browser/preloadScanner' },
          { text: '浏览器缓存机制', link: '/docs/frontend/browser/browserCache' },
          { text: '浏览器帧原理', link: '/docs/frontend/browser/browserFrame' }
        ],
        collapsed: false
      },
      {
        text: 'React',
        items: [{ text: 'Fiber', link: '/docs/frontend/react/fiber' }],
        collapsed: false
      }
    ],
    '/docs/computerScience/': [
      {
        text: '基本',
        items: [
          { text: '高速缓存Cache', link: '/docs/computerScience/basic/cache' },
          { text: '补码', link: '/docs/computerScience/basic/twosComplement' }
        ]
      }
    ],
    '/docs/dataStructures/': [
      {
        text: '基本数据结构',
        items: [{ text: '数组和链表', link: '/docs/dataStructures/basic/arrayAndLinkedList' }]
      },
      {
        text: '其他',
        items: [{ text: '字符编码', link: '/docs/dataStructures/others/characterEncoding' }]
      }
    ],
    '/docs/network/': [
      {
        text: '网络',
        items: [{ text: '三次握手和四次挥手', link: '/docs/network/tcpHandshakesAndWaves' }]
      }
    ],
    '/docs/linux/': [
      {
        text: 'Linux',
        items: [
          { text: '安装Ubuntu备忘录', link: '/docs/linux/ubuntuInstallMemo' },
          { text: 'SSH密钥生成', link: '/docs/linux/sshKeyGenerate' },
          { text: 'Docker', link: '/docs/linux/docker' }
        ]
      }
    ]
  };
};

export default sideBar;
