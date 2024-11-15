import { defineConfig } from 'dumi';
const LIBRO_DEPLOY_ENV = process.env.LIBRO_DEPLOY_ENV;
const nav = [
  { title: '介绍', link: '/introduction' },
  { title: '快速开始', link: '/quickstart' },
  { title: '使用文档', link: '/manual' },
  { title: '集成文档', link: '/integration' },
  { title: '产品新动向', link: '/updates' },
];
if (LIBRO_DEPLOY_ENV !== 'vercel') {
  nav.push({ title: '示例', link: '/examples' });
}
export default defineConfig({
  themeConfig: {
    hd: { rules: [] },
    name: 'libro',
    link: '/',
    logo: '/logo.png',
    // nav: nav,
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
    gitRepo: { owner: 'difizen', name: 'libro' },
  },
  favicons: ['/libro.svg'],
  title: 'libro',
  locales: [
    { id: 'en-US', name: 'EN' },
    { id: 'zh-CN', name: '中文' },
  ],
  plugins: [
    '@difizen/umi-plugin-mana',
    './dumi-plugin-alias',
    './dumi-plugin-deploy',
    './dumi-plugin-html-addon',
  ],
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
    '/libro/api': {
      target: 'http://localhost:8888/',
      changeOrigin: true,
      secure: false,
      pathRewrite: {},
      ws: true,
    },
  },
  analytics: {
    baidu: process.env.BAIDU_ANALYTICS,
  },
});
