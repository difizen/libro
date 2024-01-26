import { defineConfig } from 'dumi';

export default defineConfig({
  themeConfig: {
    hd: { rules: [] },
    name: 'libro',
    link: '/',
    logo: 'https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*Jl1DTrw2uxkAAAAAAAAAAAAADjOxAQ/original',
    nav: [
      { title: '介绍', link: '/introduction' },
      { title: '教程', link: '/tutorial' },
      { title: '示例', link: '/examples' },
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
    groupQR:
      'https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*udAwToe7HUQAAAAAAAAAAAAADjOxAQ/original',
    linksTitle: 'Difizen | libro',
    links: [
      {
        title: '资源',
        itemList: [
          {
            name: 'Difizen',
            link: 'https://github.com/difizen',
          },
          {
            name: 'mana',
            link: 'https://github.com/difizen/mana',
          },
          {
            name: 'libro',
            link: 'https://github.com/difizen/libro',
          },
        ],
      },
      {
        title: '社区',
        itemList: [
          {
            name: '提交反馈',
            link: 'https://github.com/difizen/mana/issues',
          },
          {
            name: '发布日志',
            link: 'https://github.com/difizen/mana/releases',
          },
        ],
      },
    ],
    techCardData: [],
  },
  extraBabelPlugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-transform-flow-strip-types', { allowDeclareFields: true }],
    ['@babel/plugin-transform-class-properties', { loose: true }],
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ['@babel/plugin-transform-private-property-in-object', { loose: true }],
    'babel-plugin-parameter-decorator',
  ],
  plugins: ['./dumi-plugin-alias', './dumi-plugin-nodenext'],
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
