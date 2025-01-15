# umi-plugin-mana

- 支持 decorator 所需的 babel 配置，在 typescript 4 环境生效
- 支持动态路由路径
- 支持 nodenext，在 import path 中允许增加扩展名
- 支持 mana 运行时能力，基于 slot 的路由等

# 引入和配置

```typescript
export default defineConfig({
  // 引入
  plugins: ['@difizen/umi-plugin-mana'],
  // 配置
  mana: {
    decorator: true,
    nodenext: true,
    routerBase: true,
    runtime: true,
  },
});
```

# 特性

## decorator

增加以下 babel 配置

```typescript
[
  ['@babel/plugin-proposal-decorators', { legacy: true }],
  ['@babel/plugin-transform-flow-strip-types', { allowDeclareFields: true }],
  ['@babel/plugin-transform-class-properties', { loose: true }],
  ['@babel/plugin-transform-private-methods', { loose: true }],
  ['@babel/plugin-transform-private-property-in-object', { loose: true }],
  'babel-plugin-parameter-decorator',
];
```

## dynamic router base

支持动态路由设置，用于一份应用的构建产物，在不同路由下访问的场景

```
// 通过 routerBase 变量控制

window.routerBase = '/router/base'
```

## nodenext

支持 ts nodenext 模式，在导入模块时，使用带有扩展名的路径

```
import {} from './path/to/module.js'
```

## mana 运行时

支持基于 mana slot 的路由配置

```typescript
export default [
  {
    path: '/',
    slot: 'layout-slot',
    routes: [
      {
        path: '/path-a',
        slot: 'a-slot',
      },
      {
        path: '/path-b',
        slot: 'b-slot',
      },
    ],
  },
];
```
