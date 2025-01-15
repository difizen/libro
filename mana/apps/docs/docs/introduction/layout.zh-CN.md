---
title: 布局与视图系统
order: 2
nav:
  title: 介绍
---

# 前言

前端应用离不开布局与组件，布局是应用的骨架而组件是其上的血肉，但是从另一个角度看布局也是一种特殊的组件。mana 必须为体系解决如下几个问题：

- 通过扩展模块为应用添加组件
- 通过扩展来修改和替换布局
- 保存与恢复页面布局状态

# 概念

## 视图

mana 基于 react 组件渲染，但是对于应用的上下文，我们并不关心所有层次的组件，例如当我们激活一个编辑器页签时，对于 dom 和 react 组件，实际是 focus 在页签上，但是我们的工具栏实际关心的是打开了编辑器面板，而不是容纳他的 tab，在执行快捷动作时，我们也要根据当前的编辑器面板做反应。这里 tab 页签和编辑器面板的差异我们处理为布局和视图的差异。
我们将真正关心的组件组织成视图，一个页面应该由布局和视图组成，在应用的上下文里我们不再关心布局和视图以外的具体组件，他们仅仅作为用户交互的事件源。
视图`View`就是带有一定数据定义和生命期表现的数据结构，简化后的数据结构定义如下：

```typescript
export interface View {
  id: string;
  view: React.FC;
}
```

基于以上结构可以看出，在实际的内部管理中，数据是优先于组件出现的，我们先基于数据完成管理能力，React 组件可以视作 dom 的工厂函数，是被数据模块所管理的。
视图在整个应用的生命期内也表现出一定的生命期，这些生命期也作为视图的公共定义

- 实例化
- 添加
- 激活
- 渲染
- 事件
- 销毁
  通过视图装饰器我们可以非常方便的在满足要求的数据结构上快速注册视图

```typescript
@singleton()
@view(FactoryId)
class MyView extends BaseView {}
```

## 插槽和区域

为了完成布局与组件的分离，我们在布局中引入了插槽`Slot`，一个布局会被区分为几个区域，每个区域会有一个区域 id，一个区域内会包含多个视图，由插槽机制完成区域的渲染。要理解 Slot 的设计，首先要理解区域，下图是一个较为常用的工作台布局区域划分。

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*C3yLQbmY67EAAAAAAAAAAAAADjOxAQ/original)

- 区域作为视图元素，提供布局能力。
  由于插槽所代表的区域本身也是一种视图元素，所以在插槽内打开的视图，也可以渲染出新的插槽，从而完成布局的嵌套，上图所示的区域划分，其中 main 和 bottom 也可以合并为 main ，并在其中进一步划分为 main-top main-bottom，具体如何划分取决于用户使用的布局组件本身。
  进一步的因为布局是可以嵌套的，所以整个应用本身也就是一个大的 Slot，我们使用默认的区域 id 来渲染。

```typescript
<Slot name="__mana_deafult_layout__" />
```

- 区域作为视图容器，允许一个或多个视图打开在此区域。
  在一般的工作台中，上面布局里的 left、bottom 等区域会提供形态和行为各异的 tab，我们会文件树打开在 left 区域；将欢迎使用打开在 main 区域；将输出打开在 bottom 区域。有时候 left 区域内并不以 tab 形式出现，而是使用手风琴布局，这些不同的区域内视图管理方式，为用户提供了不同的区域内视图管理的交互，tab 可以通过页签切换焦点，手风琴则通过展开，也或者我们提供的区域不提供以往视图的展示和切换能力，仅提供当前视图的显示。当区域作为视图容器时，他们对内有不同的表现，但是对外可以有统一表现，如添加视图、移除视图、激活视图等，这就是布局视图，我们在后面介绍。

Slot 作为区域在 React 组件内实体，他起到的主要作用是在渲染时主动打开相应的布局视图，不同于一般的视图比如欢迎使用，是依靠应用生命期触发的检查来决定是否主动打开，Slot 对应的视图容器统一在渲染是触发创建。

## 视图工厂与视图管理

在同一个页面上，我们有时会打开几个相同类型的视图，比如布局视图我们可能在多处使用 tab，功能视图我们可能会在打开多个编辑器。为了方便视图的管理，我们设计了视图工厂，每一个具体的视图都应该经过通过视图管理器用视图工厂打开，简化的定义如下

```typescript
export interface ViewFactory {
  readonly id: string;
  createView: (options?: any) => MaybePromise<View>;
}
```

经过视图工厂创建出来的视图每个应有独一无二的 id，但是对于视图管理器而言，ViewFactory id + options 就是视图的 id。
各个模块通过注册视图工厂来将自己的视图创建能力提供给视图管理器，然后在通过视图管理器创建具体的视图，这为视图提供追踪机制和统一的行为表现提供了基础。

## 插槽视图

插槽视图首先也是视图，只是增加了用于插槽布局时的行为和生命期操作，一个简化的定义如下

```typescript
export interface SlotView extends View {
  addView: (view: View, option: LayoutViewOption) => Promise<void>;
}
```

Tab、手风琴等布局组件，在占据一定区域的时候，需要基于布局视图的数据结构来实现。
布局视图在注册的时候与一般视图是一样的，为了进一步的提升布局的扩展性，通过竞争机制来决定区域的布局的渲染方式，布局视图可以通过配置处理优先级。

# 机制

## 构建顺序

默认情况下布局和实体图的构建顺序如下。
![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*Vk7hQZDsGuoAAAAAAAAAAAAADjOxAQ/original)

## 视图上下文

为了方便视图及视图内容的研发，我们提供了视图的上下文机制，这在页面上存在多例的视图研发时会比较有用。创建视图的动作可以同时为视图提供一个独立的上下文，我们将视图的数据模块本身，视图的创建配置等信息默认注入到这个上下文内。简化代码如下

```typescript
const container = ctx.container.createChild(); // 创建子容器
container.load(...some module); // 加载视图需要的模块
const current = container.get<View>(view); // 创建 View 实例
container.register({ token: ViewOption, useValue: option }); // 注册实例信息
container.register({ token: ViewInstance, useValue: current }); // 注册实例信息
current.view = ViewRender(current.view, container); // 高阶组件关联组件与上下文
return current;
```

这样我们在视图组件内，可以方便的通过注入的信息完成数据与 UI 的联动，不再需要考虑如何从多个视图内定位自己的问题，从而完成数组到单例的"降维"。

```typescript
export function Component() {
  const view = useInject<MyView>(ViewInstance);
  const option = useInject<Myoption>(ViewOption);
  return <div>{view.info}</div>;
}
```

这里为什么选择了 `Container` 而非不是 `React Context` 上下文来传递实例信息呢？其中一个考虑是 View 背后可能是一个复杂的业务模块在，我们在创建视图时初始化的信息并不一定是视图所需的全部数据，通过隔离的子容器及其内部注册的模块，可以很好的完成这些数据结构的按需初始化。关于上下文的设计这里不再展开。

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*GvQHRa9ZVmsAAAAAAAAAAAAADjOxAQ/original)

## 活跃视图

在视图上下文那里示例代码里给出通过高阶组件来给视图提供上下文的机制，实际上除了这个位置除了提供上下文，也可以通过高阶组件给视图增加实际的 dom 包裹，从而完成 dom 到 View 数据结构的关联，方便通过用户交互来追踪视图的激活状态，这在需要根据焦点而切换快捷键响应等场景下很有用。
实际上活跃视图是一个逻辑概念，真正的含义是最后一个机会的视图，设想一个这样的场景，当我们从编辑器里打开右键菜单，实际上这时候没有任何视图是激活状态，因为焦点在右键菜单上，但是我们认为激活的是编辑器面板，因为这是最后一个激活的视图。

## 页面保存与恢复

有了上述机制以后，页面的保存和恢复变得简单了，用户页面状态的保存的实现，实现就是结构化的保存下来布局与视图的嵌套关系，及其打开条件。而他们之间也只有包含关系一种。在页面保存时，我们只需按照现有的包含结构遍历，将视图 factory id，配置信息，子视图以及区域信息保存起来即可，视图为可保存视图时，再调用其保存方法，进一步获取视图的自定义信息。

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*6Ww2Srfh_msAAAAAAAAAAAAADjOxAQ/original)

```typescript
{
  "__mana_deafult_layout__": {
    id: 'left-right-layout';
    area: {
      left: {
        id: 'left-right-layout';
        contents: [{
            id: 'file-tree',
        }],
      },
      right: {
        id: 'tab';
        contents: [{
            id: 'code-editor',
          	options: {uri:'xxx'}
        }],
      }
    }
  }
}
```

而当页面恢复时，可以从已经保存的布局信息中重新遍历完成对视图的打开和添加动作，即可完成恢复。
页面的保存和恢复均可配合应用生命期完成。

## 视图与插槽设置

我们内置了视图和插槽配置的扩展点，用户可以在模块内方便的声明对视图和插槽的配置，并设置其优先级。
其中插槽的配置指的是插槽使用什么样的视图做其他视图的管理，视图的配置指的是在默认情况下，视图创建的默认位置和参数等信息。

```typescript
// 视图配置
export interface ViewPreference {
  autoCreate?: boolean; // 在应用启动时创建实例
  slot?: string; // 默认打开位置
  priority?: number; // 优先级
  options?: any; // 默认配置
}
// 插槽配置
export interface SlotPreference {
  factory: string; // 插槽默认的插槽视图
  priority?: number; // 优先级
  options?: any; // 默认配置
}

// module
createViewPreference(ViewPreference);
createSlotPreference(SlotPreference);
```

# 其他

在一般在 React 应用中，我们是自上而下的组织组件的，也就是应用顶层作为一个组件，其依赖具体的布局，布局再依赖其中的细节的组件，这种层层嵌套的结构，每一步都由一个整体依赖细节的关系所组成，这样就意味着其其中的每一层都变得耦合，这种耦合是很多问题的根源。起到布局作用的组件，实际上要知道其中可能出现的组件，进行有选择的渲染；而修改组件出现的位置等，也往往要去布局层次修改。这里的布局和组件设计，根本的目的可能是让布局回归布局，让组件回归组件，从而允许他们被更好的重用。
