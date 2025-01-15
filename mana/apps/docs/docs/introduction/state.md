---
title: State management design
order: 2

nav:
  title: Introduction
---

# The State Management We Need

First, let's look at what the state in mana looks like. If we differentiate the state in mana based on whether it affects the UI, we quickly find that they are intertwined, so we cannot isolate a set of states that affect the UI within mana. Most of the data states in mana are concentrated together according to business and abstraction, and much of their logic is not solely for the UI. Therefore, in mana, we hope to separate logic from UI, allowing states to be organized in logic regardless of whether they drive the UI, without needing excessive changes or rewriting business logic to drive the UI.

- Can we use data structures similar to [immer](https://github.com/immerjs/immer)? We find that due to the need for functional composition, object references within mana are stable, which is similar to why [immer cannot integrate with mobx](https://github.com/immerjs/immer/issues/29).
- Can we use the [mobx](https://mobx.js.org/README.html) solution? For mana, the mobx approach is still too demanding, as we must consider whether a module will eventually drive the UI before writing it, which is usually not the case in mana.
  Ultimately, we chose to build a reactive data structure suitable for OOP scenarios, using dependency tracking to achieve two-way binding with the UI, drawing on concepts from [vue](https://cn.vuejs.org/) and mobx.

# Simple Data Management

## Basic Types

The most basic situation is support for basic types.

```typescript
class State {
  @prop()
  count: number = 0;
}
const state = new State();
```

The `prop` decorator converts properties into observable properties, and the usage of properties is completely consistent with usual cases. Use it in React as follows:

```typescript
export default () => {
  const observableState = useObserve(state);
  return (
    <Button onClick={() => (state.count += 1)}>observableState.count</Button>
  );
};
```

When we manipulate the `count` property outside the component, it can also trigger UI changes.

## Basic Data Structures

In addition to basic types, we need support for basic data structures. Currently, Array, Map, and PlainObject are supported. With these data structures, general data state management can be satisfied.

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

To support basic data structures, we support reactive transformations of basic data structures, allowing independent data structures to be used reactively in components.

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

## Nesting

Generally, our state is completed by nesting the above states, whether it is the nesting of the basic data structures themselves or the nesting of basic data structures with objects. We can complete dependency collection and data binding in nested states, so examples will not be provided here.

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*HveHQLgAfH0AAAAAAAAAAAAADjOxAQ/original)

We achieve data binding by converting them into observable objects for UI rendering.

# Complex Situations and Performance Optimization

In addition to the basic situations mentioned above, we also need to consider complex UI scenarios, providing support or clarifying usage for certain scenarios.

## Sharing

Whether it is an object or a basic data structure, they are converted into observable objects for use by the UI. Just like stable references, we ensure this transformation is stable. The observable object of an object is still itself, and its observability is mainly reflected in its properties. We can use the observable API to obtain observable objects.

```typescript
observableState = observable(state);
observable(state) === observableState; // true
observable(observableState) === observableState; // true
```

On this basis, we can complete the sharing of observable properties.

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

If the observable properties of the above-linked classes are used in the UI, any change to the value of `basic` will refresh the entire UI.

## Passing

Although the change of observable objects is stable, when using them to drive the UI, we do not directly use observable objects because we need to accurately manage the relationship between changes in observable objects and the specific UI context. This requires a second layer of transformation, which needs to be completed in the rendering context. `useObserve` not only completes the change of the observable object but also completes the binding with the rendering context.
However, this binding relationship affects how objects are used when passed between components:

```typescript
export default () => {
  const observableState = useObserve(state);
  return (
    <ChildRender state={observableState}>
  );
};

const ChildRender = (props) => {
  const { state } = props; // count change will refresh the parent component
  const state = useObserve(props.state); // count change will only refresh the child component
  return (
    <div>state.count</div>
  );
}
```

As in the example above, when passing observable objects between components, we should use `useObserve` again to rebind the rendering context. Otherwise, using dependencies will trigger refreshes at the original context, expanding the refresh scope.

In fact, we encourage avoiding parameter passing between components as much as possible and instead obtaining public references of state objects. In mana, we use data state management in conjunction with dependency injection and achieve state management with almost no parameter passing through context management. On this basis, since the consumption of states is more through stable references, we can confidently use `React.memo` for all components to further isolate the impact of parent component refreshes on child components.

## Collect on Demand

In mana-observable, we collect the observable objects and their properties that users actually use during rendering. We believe that only properties actually used in the last render need to trigger the next update when their values change. In actual rendering, starting from an observable object, the data it can access and its nested structures can be viewed as a tree. Only when nodes accessed on this tree change will the next rendering be triggered.

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*YG2TSqr1ntYAAAAAAAAAAAAADjOxAQ/original)

Suppose there is an object relationship tree as shown above, where the properties of colored nodes are accessed during rendering. Then changes in their values will trigger re-rendering, while changes in the properties of the gray parts will not trigger re-rendering since they were not used in rendering.

In principle, unless basic data structures are used directly, the trigger for re-rendering will always reflect changes in a property. Here, changes within basic data structures are also elevated to changes in their top-level properties and considered as changes to trigger UI changes.

## Transform on Demand

To further improve performance and simplify writing, our observable data transformation occurs when an object is first attempted to be observed.

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

Generally, we do not need to pay attention to this change or its timing, because it does not affect the API for external alignment access.

# Principle

Generally, we hope the logic of UI rendering can be simple and pure, ideally expressed as $f(state)=>UI$. In actual scenarios, the state is constantly changing, so we hope to find a method to drive UI changes based on state changes.

- Immutable Data Structure + Dirty Checking
  One approach is to reflect changes within the state as changes in the state itself, leading to the emergence of immutable data structure-driven methods. In this approach, both state and UI are decomposed layer by layer, so the cost of rebuilding the state in each layer is not too high. Changes in data are always passed to the previous layer, using whole-layer changes to drive the UI. When the State is separated into a large Store, dirty checking at different levels is often required.
- Mutable Data Structure + Dependency Tracking
  Another approach is to respond to specific changes within the state, binding changes to the UI levels that use it. To locate the relationship between data and UI consumption, this method of locating is dependency tracking, focusing on the context of data consumption and forming associations based on it. In this way, when data changes, data change events are collected and mapped to different UI level refreshes.

mana-observable is implemented using the mutable data structure + dependency tracking approach for reactivity, and its principles are similar to the reactive principles in mobx or vue. If you understand the reactive principles of these, you should be able to quickly grasp the reactive processing done by mana-observable.

- Mutable Data Structure
  We have two kinds of mutable data structures: object properties and basic data structures, with object properties being the absolute mainstay. In the simple data management section earlier, we have introduced them and demonstrated their nested relationships.
  - Object properties are transformed into getter/setter definitions.
  - Basic data structures are accessed through proxies, reflecting changes layer by layer as top-level changes or changes in the properties they serve.
- Dependency Tracking
  The purpose of dependency tracking is to establish links between traced properties or data structures and the current UI, allowing their changes to trigger UI updates. The specific UI update action is obtained from the UI context. Since dependency tracking needs to track deeply across multiple levels, the update actions obtained from the context must be passed through multiple levels. We use proxies to complete dependency tracking, and users build the first layer of proxies for tracking in the UI context. The next layer of properties accessed by it will also be wrapped as proxies based on the context held, thus achieving deep tracking.

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*8rRlSqJptGkAAAAAAAAAAAAADjOxAQ/original)

We complete the reactive data flow as shown in the figure above. During UI rendering, Render obtains observable objects from the context and accesses their properties. The access process is proxied by Tracker and the usage of properties in the current context is recorded in Notifier. UI and data models operate property values in the same way, and changes in property values notify the corresponding Notifier, which triggers Render to re-render, entering the next response cycle.

# Cross-Framework

In the principle introduction section, we abstracted rendering into the form of $f(state)=>UI$, which is not limited to the React framework. The data cycle, after simplification, is actually a cycle of the Render method and data changes. In theory, frameworks that update UI in the following form can be supported.

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*f-MwTKSVBDEAAAAAAAAAAAAADjOxAQ/original)

We tried data-driven approaches on the [lumino](https://github.com/jupyterlab/lumino) component library, which is relied upon by [jupyterlab](https://github.com/jupyterlab/jupyterlab), and [phosphor](https://phosphorjs.github.io/), which is relied upon by [theia](https://github.com/eclipse-theia/theia).

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

# Combined with Dependency Injection

The design oriented towards OOP is very suitable for use in complex scenarios with dependency injection (DI) systems. In a dependency injection system, due to the high cost of instance reconstruction, introducing global instances for functional composition is easier and is a scenario very suitable for mana-observable. We provide the `useInject` method to support the use of injectable elements in components in a Hooks manner and provide the `ObservableContext` context for switching the context of the dependency injection container.

```typescript
const Render = () => {
  const state = useInject(State);
  return <>state.count</>;
};
```

For dependency injection containers, we recommend the mana-syringe solution, which can be compatible with other dependency injection solutions by supporting the following context interface.

```typescript
type Container = {
  get: <T>(identifier: Token<T>) => T;
  createChild: () => Container;
};
```

Dependency injection can provide strong context-switching support for mana-observable. Combined with concepts like child containers, it can greatly reduce application logic complexity in multi-dimensional data structures.
