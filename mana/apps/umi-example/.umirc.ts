import { defineConfig } from 'umi';

export default defineConfig({
  routes: [
    { path: '/', component: 'index' },
    { path: '/docs', component: 'docs' },
  ],
  npmClient: 'pnpm',
  plugins: ['@difizen/umi-plugin-mana'],
  mana: {
    decorator: true,
    runtime: true,
  },
});
