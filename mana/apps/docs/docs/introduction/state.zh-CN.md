---
title: 状态管理设计
order: 2
nav:
  title: 介绍
---

# 我们需要的状态管理

我们先来看 mana 里的状态是什么样子的？如果我们按照是否作用于 UI 来区分 mana 里的状态，很快会发现他们是纠缠在一起的，所以我们无法在 mana 里独立出作用于 UI 的状态集合，mana 里的数据状态大部分情况系是按照业务和抽象集中在一起的，他们的很多运行逻辑并不仅仅是为 UI 服务的。
所以在 mana 里我们希望逻辑与 UI 可以分离，不管一个状态是否驱动 UI，他都可以按照一般写法组织在逻辑里，不需要为了驱动 UI 而做出过多改变以至于重写业务逻辑。

- 是否可以使用类似 [immer](https://github.com/immerjs/immer) 的数据结构？我们会发现出于功能组合的需求，mana 内的对象引用是稳定的，这与 [immer 为什么不能集成到 mobx ](https://github.com/immerjs/immer/issues/29)是有相似之处的。
- 是否可以使用 [mobx](https://mobx.js.org/README.html) 方案？对 mana 来说，mobx 写法要求依然过多，我们必须在写一个模块之前就考虑到他最终是否会驱动 UI，在 mana 里通常不是这样的。
  我们最终选择构建一套适用于 OOP 场景的响应式数据结构，采用依赖追踪的方式对 UI 做双向绑定，实现思路上参考了 [vue](https://cn.vuejs.org/) 和 mobx。

# 简单的数据管理

## 基本类型

最基础的情况是对基本类型的支持

```typescript
class State {
  @prop()
  count: number = 0;
}
const state = new State();
```

通过 `prop` 装饰器将属性转换为可观察属性，此外对于属性的使用与一般情况完全一致，在 React 中使用如下

```typescript
export default () => {
  const observableState = useObserve(state);
  return (
    <Button onClick={() => (state.count += 1)}>observableState.count</Button>
  );
};
```

当我们在组件之外对 `count` 属性进行操作时，也可以触发 UI 的变化。

## 基础数据结构

除了基本类型以外，我们还需要支持基础数据结构，当前支持 ArrayMapPlainObject, 有了这些数据结构的支持，一般的数据状态管理就可以满足了。

```typescript
class State {
  @prop()
  list: string[] = [];
}
const state = new State();

export default () => {
  const observableState = useObserve(state);
  return <>observableState.list.length</>;
};
```

为了完成对基础数据结构的支持，我们支持了对基础数据结构的响应式变换，所以独立的数据结构也可以在组件里以响应式的方式使用

```typescript
export default () => {
  const observableArrary = useObserveState([]);
  return (
    <Button onClick={() => observableArrary.push("")}>
      observableState.count
    </Button>
  );
};
```

## 嵌套

一般情况下，我们的状态就是由上述状态的嵌套来完成的，不管是基础数据结构本身的嵌套，还是基础数据结构与对象的嵌套，我们都可以完成在嵌套状态下的依赖收集与数据绑定，这里不再给出例子。

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*HveHQLgAfH0AAAAAAAAAAAAADjOxAQ/original)

我们通过将他们转换为可观察对象，用于 UI 渲染从而完成数据绑定。

# 复杂情况与性能优化

除了上述基本情况，我们还要考虑到 UI 的复杂场景，对一些场景给出支持，或者明确用法。

## 共享

不管是对象还是基础数据结构，都是转换为可观察对象以后再给 UI 使用的，就像引用的稳定一样，我们保证这种变换是稳定的，对象的可观察对象仍然是其本身，其可观察性主要体现在属性上。我们可以使用 observable API 来获取可观察对象。

```typescript
observableState = observable(state);
observable(state) === observableState; // true
observable(observableState) === observableState; // true
```

在此基础上，我们可以完成可观察属性的共享。

```typescript
const basic = observable({
  count: 0,
});

class StateFoo {
  @prop() basic = basic;
}
class StateBar {
  @prop() basic = basic;
}
```

如果在 UI 中使用了上述链各个类的可观察属性，则无论从哪个改变了 basic 的值，UI 全部都会刷新。

## 传递

虽然可观察对象的变化是稳定的，但是在使用驱动 UI 时，我们并不是直接使用了可观察对象，因为我们需要准确的管理可观察对象的变化与具体的 UI 上下文之间的关系，这就需要第二层变换，这层变换需要在渲染上下文中完成。useObserve 不仅完成了可观察对象变化，也同时完成了与渲染上下文的绑定。
但是这种绑定关系会影响到对象在组件间传递的使用方式：

```typescript
export default () => {
  const observableState = useObserve(state);
  return (
    <ChildRender state={observableState}>
	);
};

const ChildRender = (props) => {
  const { state } = props; // count 变化会让父组件刷新
  const state = useObserve(props.state); // count 变化会只会让子组件刷新
  return (
    <div>state.count</div>
	);
}
```

如上面例子里，当组件间进行可观察对象传递时，我们应当再次使用 useObserve 来重新绑定渲染上下文，否则对依赖的使用，会触发到原上下文的位置，从而造成刷新范围扩大。

实际上，我们鼓励尽量不适用组件间参数传递，应当尽量拿到状态对象的公共引用。在 mana 中，我们将数据状态管理与依赖注入一起使用，并通过上下文管理做到几乎不使用参数传递的状态管理。在此基础上，由于对状态的消费更多是通过稳定的引用来进行，我们可以放心的对所有组件使用 React.memo 来进一步隔离父组件刷新对子组件的影响。

## 按需收集

在 mana-observable 中，我们会在渲染过程中收集用户实际使用到可观察对象及其属性，我们认为只有上一次渲染中实际使用到的属性，才有需要在值变更的时候触发下一次更新。实际渲染中从一个可观察对象开始，他可以访问的数据和嵌套结构，可以看做一棵树，只有树上被访问的节点发生变化时，才会触发下一次渲染。

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*YG2TSqr1ntYAAAAAAAAAAAAADjOxAQ/original)

假设存在上图中的对象关系树，带有颜色的节点的属性是在渲染中访问到的属性信息，那么其值的变更会触发重新渲染，而灰色部分由于在渲染中没有用到，则对应的属性值或者其内部的信息变更时，不会触发重新渲染。

从原理上将，除非直接使用基础数据结构，否则重新渲染的触发一定反映在某个属性的变更上，这里我们将基础数据结构内部的变更，也上升到其顶层属性的变更，认为是变更的一种，从而触发 UI 变化。

## 按需转换

为了进一步的提升性能和简化写法，我们的可观察数据转换发生在第一次尝试观察对象时

```typescript
const arr: number[] = [];
class State {
  @prop()
  arr: number[] = arr;
}
const state = new State();

// before render
state.arr = arr; // true

// after render

state.arr = arr; // false
state.arr = observable(arr); // true
```

一般而言，我们不用关注这种变化及其发生的时机，因为这种变化并不影响外部对齐访问的 API。

# 原理

一般的，我们希望 UI 渲染的逻辑能够简单纯粹，最好可以表达为 $f(state)=>UI$ 的形式，实际场景中 state 是一直在变的，于是我们希望找到 state 变更驱动 UI 变化的方法。

- 不可变数据结构 + 脏检查
  一种思路是将 state 内部的变化，反应为 state 本身的变化，于是不可变数据结构的驱动方式出现了，这种思路下 state 与 UI 都逐层的分解，让每一层里重建 state 的成本不至于过高，数据的变更总是传递到上一层，用整层的变更来驱动 UI，当 State 被分离为一个大的 Store 时，往往要配合不同层次的脏检查；
- 可变数据结构 + 依赖追踪
  另一种思路是响应 state 中具体的变化，将变更绑定在使用它的 UI 层次上，为了定位到数据与 UI 的消费关系，这种定位方法就是依赖追踪，在数据消费的时候关注数据消费时的上下文，并据此形成关联。这样在数据变更时，收集数据变更的事件，将其映射到不同 UI 层次的刷新上。

mana-observable 是使用可变数据结构+依赖追踪的方式来实现响应式的，其原理与 mobx 或者 vue 中的响应式原理有很多相似之处，如果对他们的响应式原理有所了解，应该能够快速的理解 mana-observable 所做的响应式处理。

- 可变数据结构
  我们的可变数据结构有两种，对象属性和基础数据结构，其中对象属性应该是绝对主力。在前文简单的数据管理部分，已经对他们进行了介绍。并展示了他们的嵌套关系。
  - 对象属性，我们将其转化为 getter/setter 定义。
  - 基础数据结构，通过 proxy 访问，逐层的将其变更反应为顶层的变更，或者是其所服务的属性的变更。
- 依赖追踪
  依赖追踪目的是建立被追踪的属性或数据结构，与当前 UI 之前的联系，让他们的变更可以触发 UI 的更新，这里具体 UI 的更新动作是从 UI 上下文中获取的。依赖追踪需要在多个层次里深度追踪的，那么就要把上文里获取的更新动作，在多个层次间传递，我们这里使用 proxy 完成依赖追踪，用户在 UI 的上下文里构建用于追踪的第一层 proxy，通过其访问的下一层属性，符合条件的时候也会基于持有的上下文包装成 proxy，从而实现深层追踪。

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*8rRlSqJptGkAAAAAAAAAAAAADjOxAQ/original)

我们完成响应式的数据流如上图所示，Render 在渲染 UI 时，从上下文中获得可观察对象，并访问其属性，访问过程被 Tracker 代理，并将当前上下文对属性的使用记录在 Notifier 中，UI 和数据模型以相同的数据变更方式操作属性值，属性值的变更，将通知到对应的属性的 Notifier，由其触发 Render 重新渲染，进入下一轮的响应周期。

# 跨框架

在原理介绍的部分，我们将渲染抽象为了 $f(state)=>UI$ 的形式，这里并不限定在 React 框架，而数据循环经过简化，实际上是 Render 方法和数据变更的循环，理论上以如下形式进行 UI 更新的框架都可以支持。

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*f-MwTKSVBDEAAAAAAAAAAAAADjOxAQ/original)

我们尝试了在 [jupyterlab](https://github.com/jupyterlab/jupyterlab) 依赖的 [lumino](https://github.com/jupyterlab/lumino) 组件库上进行数据驱动，[theia](https://github.com/eclipse-theia/theia) 依赖的 [phosphor](https://phosphorjs.github.io/) 同理。

```typescript
class ObservableWidget extends Widget {
  stateDiv: HTMLDivElement;
  selfDiv: HTMLDivElement;
  @prop() count: number = 0;
  constructor(options?: Widget.IOptions) {
    super(options);
    this.stateDiv = document.createElement('div');
    this.selfDiv = document.createElement('div');
    this.node.appendChild(this.stateDiv);
    this.node.appendChild(this.selfDiv);
    this.update();
  }
  update(): void {
    const self = this.observe(this);
    const observableInstance = this.observe(instance);
    this.stateDiv.innerHTML = `State count: ${observableInstance.count}`;
    this.selfDiv.innerHTML = `ObservableWidget count: ${self.count}`;
  }
  observe<T = any>(state: T): T {
    return Tracker.track(state, this.update.bind(this));
  }
}
```

# 配合依赖注入

面向 OOP 的设计，非常适合在复杂场景下配合依赖注入(DI)体系使用，在依赖注入体系中，由于实例的重建成本较高，全局实例的引入进行功能组合更加容易，是非常适合 mana-observable 的场景。我们提供了 useInject 方法来支持在组件中以 Hooks 的方式使用可注入元素，并提供了 ObservableContext 上下文，用于切换依赖注入容器的上下文。

```typescript
const Render = () => {
  const state = useInject(State);
  return <>state.count</>;
};
```

对于依赖注入容器，我们推荐 mana-syringe 方案，可以通过如下上下文接口的支持来兼容其他太依赖注入方案。

```typescript
type Container = {
  get: <T>(identifier: Token<T>) => T;
  createChild: () => Container;
};
```

依赖注入可以为 mana-observable 提供强大的上下文切换支持，配合子容器等概念，可以极大的降低多维数据结构下的应用逻辑复杂度。
