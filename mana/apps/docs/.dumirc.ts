import { defineConfig } from 'dumi';

export default defineConfig({
  themeConfig: {
    hd: { rules: [] },
    name: 'mana',
    link: '/',
    logo: '/mana.svg',
    footer: `Open-source MIT Licensed | Copyright © 2023-present`,
    prefersColor: { default: 'light' },
    links: [
      {
        title: 'Related',
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
        title: 'Community',
        itemList: [
          {
            name: 'feedback issues',
            link: 'https://github.com/difizen/mana/issues',
          },
          {
            name: 'release notes',
            link: 'https://github.com/difizen/mana/releases',
          },
        ],
      },
    ],
    qrcodes: [
      {
        name: '钉钉',
        qrcode: '/ding-qrcode.png',
      },
    ],
    gitRepo: { owner: 'difizen', name: 'mana' },
  },
  locales: [
    { id: 'en-US', name: 'EN' },
    { id: 'zh-CN', name: '中文' },
  ],
  favicons: ['/mana.svg'],
  plugins: ['@difizen/umi-plugin-mana', './dumi-plugin-alias'],
  mana: {
    decorator: true,
    nodenext: true,
  },
  exportStatic: {},
  resolve: {
    docDirs: ['docs'],
    codeBlockMode: 'passive',
  },
});
