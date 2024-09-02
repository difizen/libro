import { defineConfig } from 'dumi';

export default defineConfig({
  themeConfig: {
    hd: { rules: [] },
    name: 'libro',
    link: '/',
    logo: '/libro.svg',
    nav: [
      { title: '介绍', link: '/introduction' },
      { title: '快速开始', link: '/quickstart' },
      { title: '使用文档', link: '/manual' },
      { title: '集成文档', link: '/integration' },
      // { title: '示例', link: '/examples' },
    ],
    banner: {
      title: 'libro',
      desc: '不只是 notebook',
      botton: [
        {
          name: '了解更多',
          link: '/introduction',
        },
        {
          name: 'Github',
          link: 'https://github.com/difizen/libro',
        },
      ],
    },
    footer: `Open-source MIT Licensed | Copyright © 2023-present`,
    // prefersColor: { default: 'light' },
    links: [
      {
        title: '相关资源',
        itemList: [
          {
            name: 'Difizen',
            link: 'https://github.com/difizen',
          },
          {
            name: 'Difizen｜libro',
            link: 'https://github.com/difizen/libro',
          },
          {
            name: 'Difizen｜mana',
            link: 'https://github.com/difizen/mana',
          },
          {
            name: 'Difizen｜magent',
            link: 'https://github.com/difizen/magent',
          },
        ],
      },
      {
        title: '社区',
        itemList: [
          {
            name: '提交反馈',
            link: 'https://github.com/difizen/libro/issues',
          },
          {
            name: '发布日志',
            link: 'https://github.com/difizen/libro/releases',
          },
        ],
      },
    ],
    qrcodes: [
      {
        name: '钉钉',
        qrcode: 'ding-qrcode.png',
      },
    ],
    gitRepo: { owner: 'difizen', name: 'libro' },
  },
  favicons: ['/libro.svg'],
  plugins: ['@difizen/umi-plugin-mana', './dumi-plugin-alias', './dumi-plugin-ga'],
  mana: {
    decorator: true,
    nodenext: true,
  },
  exportStatic: {},
  resolve: {
    docDirs: ['docs'],
    codeBlockMode: 'passive',
  },

  // dev
  proxy: {
    '/api': {
      target: 'http://localhost:8888/',
      changeOrigin: true,
      secure: false,
      pathRewrite: {},
      ws: true,
    },
    '/files': {
      target: 'http://localhost:8888/',
      changeOrigin: true,
      secure: false,
      pathRewrite: {},
      ws: true,
    },
    '/lsp': {
      target: 'http://localhost:8888/',
      changeOrigin: true,
      secure: false,
      ws: true,
    },
  },
});
