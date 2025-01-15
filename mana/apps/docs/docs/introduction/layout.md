---
title: Layout and view system
order: 2

nav:
  title: Introduction
---

# Preface

Frontend applications cannot do without layout and components. Layout is the skeleton of the application, while components are its flesh. Viewed from another angle, layout is also a special kind of component. Mana must solve the following issues for the system:

- Add components to the application through extension modules
- Modify and replace layouts through extensions
- Save and restore page layout states

# Concepts

## View

Mana is based on React component rendering. However, for the application's context, we are not concerned with all levels of components. For instance, when we activate an editor tab, in terms of DOM and React components, the focus is actually on the tab. However, our toolbar is actually concerned with the editor panel being open, not the tab containing it. When executing quick actions, we must also respond based on the current editor panel. Here, the difference between the tab and the editor panel is treated as the difference between layout and view.

We organize the components we truly care about into views. A page should consist of both layout and view. In the application's context, we no longer concern ourselves with specific components beyond layout and view; they merely serve as sources of user interaction events. A view `View` is a data structure with certain data definitions and lifecycle expressions. The simplified data structure is defined as follows:

```typescript
export interface View {
  id: string;
  view: React.FC;
}
```

Based on the above structure, it can be seen that in actual internal management, data appears prior to components. We first complete management capabilities based on data, and React components can be regarded as factory functions for the DOM, managed by the data module. Views also exhibit certain lifecycles throughout the application's lifetime, and these lifecycles serve as the common definition of views:

- Instantiation
- Addition
- Activation
- Rendering
- Events
- Destruction

Through view decorators, we can very conveniently and quickly register views on data structures that meet the requirements.

```typescript
@singleton()
@view(FactoryId)
class MyView extends BaseView {}
```

## Slots and Areas

To achieve the separation of layout and components, we introduced `Slot` into the layout. A layout is divided into several areas, each with an area ID, and each area contains multiple views. The slot mechanism completes the rendering of areas. To understand the design of Slot, one must first understand areas. The image below shows a commonly used workspace layout area division.

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*C3yLQbmY67EAAAAAAAAAAAAADjOxAQ/original)

- Areas serve as view elements, providing layout capabilities.
  Since the areas represented by slots are also a kind of view element, views opened within a slot can render new slots, thereby achieving layout nesting. In the area division shown in the image above, main and bottom can also be merged into main, and further divided into main-top and main-bottom. How to divide them specifically depends on the layout components used by the user themselves.
  Furthermore, because layouts can be nested, the entire application itself is also a large Slot, and we use default area IDs to render it.

```typescript
<Slot name="__mana_deafult_layout__" />
```

- Areas act as view containers, allowing one or more views to open in this area.
  In a typical workspace, areas like left and bottom in the layout above will offer tabs with different forms and behaviors. We might open a file tree in the left area, open a welcome page in the main area, and open outputs in the bottom area. Sometimes, the left area does not appear in the form of tabs but uses an accordion layout. These different view management methods within areas provide users with various interactions for managing views within an area. Tabs can switch focus through tabs, accordions through expansion, or perhaps the areas we provide do not offer the usual view display and switching capabilities, only displaying the current view. When areas serve as view containers, they have different internal behaviors but can have a unified external representation, such as adding views, removing views, activating views, etc. This is the layout view, which we will introduce later.

Slots serve as entities of areas within React components. Their main role is to proactively open the corresponding layout views during rendering. Unlike general views such as the welcome page, which rely on application lifecycle-triggered checks to decide whether to open proactively, the view containers corresponding to Slots are uniformly triggered to create during rendering.

## View Factory and View Management

On the same page, we sometimes open several views of the same type. For example, we might use tabs in multiple places for layout views, and for functional views, we might open multiple editors. To facilitate the management of views, we designed a view factory. Each specific view should be opened through the view manager using the view factory. The simplified definition is as follows:

```typescript
export interface ViewFactory {
  readonly id: string;
  createView: (options?: any) => MaybePromise<View>;
}
```

Each view created by the view factory should have a unique ID, but for the view manager, the ViewFactory ID + options constitute the view's ID. Each module registers its view factory to provide its view creation capabilities to the view manager, which then creates specific views through the view manager. This provides the foundation for a tracking mechanism and unified behavior for views.

## Slot View

Slot views are primarily views as well, but with additional behaviors and lifecycle operations for slot layouts. A simplified definition is as follows:

```typescript
export interface SlotView extends View {
  addView: (view: View, option: LayoutViewOption) => Promise<void>;
}
```

When layout components like tabs and accordions occupy a certain area, they need to be implemented based on the data structure of the layout view. When registering, layout views are the same as general views. To further enhance layout extensibility, a competitive mechanism is used to determine the rendering method of the area's layout, and layout views can handle priority through configuration.

# Mechanism

## Build Order

By default, the build order of layouts and entity graphs is as follows.
![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*Vk7hQZDsGuoAAAAAAAAAAAAADjOxAQ/original)

## View Context

To facilitate the development of views and view content, we provide a view context mechanism, which is useful when developing multiple instances of views on a page. The action of creating a view can simultaneously provide an independent context for the view. We inject information such as the view's data module itself and the view's creation configuration into this context by default. The simplified code is as follows:

```typescript
const container = ctx.container.createChild(); // Create a child container
container.load(...some module); // Load the modules needed by the view
const current = container.get<View>(view); // Create a View instance
container.register({ token: ViewOption, useValue: option }); // Register instance information
container.register({ token: ViewInstance, useValue: current }); // Register instance information
current.view = ViewRender(current.view, container); // Higher-order component associates component with context
return current;
```

In this way, within the view component, we can easily complete the linkage between data and UI through the injected information. There is no longer a need to consider how to locate oneself within multiple views, thus achieving the "dimensionality reduction" from array to singleton.

```typescript
export function Component() {
  const view = useInject<MyView>(ViewInstance);
  const option = useInject<Myoption>(ViewOption);
  return <div>{view.info}</div>;
}
```

Why choose `Container` instead of `React Context` to pass instance information? One consideration is that behind a View there might be a complex business module. The information initialized when creating a view might not be all the data needed by the view. By using isolated child containers and the modules registered within them, we can effectively achieve on-demand initialization of these data structures. We won't elaborate on the context design here.

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*GvQHRa9ZVmsAAAAAAAAAAAAADjOxAQ/original)

## Active View

In the example code in the view context section, a higher-order component is used to provide a context mechanism to the view. In fact, besides providing context, a higher-order component can also add an actual DOM wrapper to the view, thereby associating the DOM with the View data structure. This makes it convenient to track the activation state of a view through user interaction, which is useful in scenarios where shortcut key responses need to switch based on focus. In reality, the active view is a logical concept, meaning the view of the last opportunity. Imagine a scenario where we open a right-click menu from the editor; technically, no view is active at this...

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

When the page is restored, the previously saved layout information can be traversed again to complete the actions of opening and adding views, thus completing the restoration. Both page saving and restoring can be integrated with the application's lifecycle.

## View and Slot Settings

We have built-in extension points for view and slot configurations, allowing users to easily declare configurations for views and slots within a module and set their priorities. Slot configuration refers to what kind of view is used to manage other views, while view configuration refers to default information such as the default location and parameters for view creation.

```typescript
// View Configuration
export interface ViewPreference {
  autoCreate?: boolean; // Create an instance when the application starts
  slot?: string; // Default open location
  priority?: number; // Priority
  options?: any; // Default configuration
}

// Slot Configuration
export interface SlotPreference {
  factory: string; // Default slot view for the slot
  priority?: number; // Priority
  options?: any; // Default configuration
}

// module
createViewPreference(ViewPreference);
createSlotPreference(SlotPreference);
```

# Others

In a typical React application, components are organized from top to bottom, meaning the top level of the application acts as a component that relies on specific layouts, and the layouts rely on detailed components within them. This nested structure is composed of a holistic dependency on details at every step, which means each layer becomes coupled to the others. This coupling is the root of many problems. Components that serve as layouts need to know the potential components that may appear within them to render selectively. Modifying the location of components often requires changes at the layout level. The fundamental goal of layout and component design here is to allow layouts to remain layouts and components to remain components, thus enabling better reusability.
