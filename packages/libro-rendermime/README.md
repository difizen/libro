# libro-rendermime

该包提供了 `LibroRenderMimeModule` 模块用于识别不同数据格式的内容并且正确解析渲染。通过定义多个 MIME 类型和优先级，可以在不同的环境中提供灵活的输出展示选项，以适应各种类型的数据和前端环境的要求。内置了文本、图片、Markdown、HTML、SVG 等 MIME 渲染器，同时提供 MIME 渲染器扩展，支持扩展更多自定义的 MIME 类型渲染。

## Token/API

### RenderMimeRegistry

RenderMimeRegistry 管理 MIME，提供获取当前输出最合适的 MIME 类型，基于输出和类型创建对应的渲染器，MIME 渲染监听等能力。

```typescript
// 组件内引入
const renderMimeRegistry = useInject(RenderMimeRegistry);

// 属性引入
@inject(RenderMimeRegistry) renderMimeRegistry:RenderMimeRegistry;

// 事件监听
renderMimeRegistry.onMimeRender();

//获取当前输出最合适的 MIME 类型
const preferredMimeType = renderMimeRegistry.preferredMimeType(model)

//基于输出和类型创建对应的渲染器
const OutputRender = defaultRenderMime.createRenderer(
  preferredMimeType,
  model,
);
```

## 扩展点

### MIME 渲染器扩展

```typescript
export interface RenderMimeContribution {
  canHandle: (model: BaseOutputView) => number;
  safe: boolean;
  renderType: string;
  mimeTypes: string[];
  render: React.FC<{ model: BaseOutputView; options?: Record<string, any> }>;
}
```
