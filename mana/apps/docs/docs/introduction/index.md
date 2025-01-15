---
nav:
  title: Introduction

title: Mana Introduction
order: 1
---

# Mana Introduction

## 1. Why Mana

With the development of web-based productivity tools (hereafter referred to as IDE-style products), we realized that IDE-style workstation applications share commonalities. They are all designed to create value, focus on efficiency, and pursue an immersive experience. While there are some similarities in product form, actual integration is not easy.

- Technology stack issues: There is a significant gap between the technical systems of traditional IDEs and current mainstream front-end technologies. Both vscode and notebook systems are relatively closed.
- Lack of reuse standards: Core modules (canvas, editor) support extensions, but the way extensibility is defined varies, as do the reuse methods (components, plugins, modules). Especially in IDE-style workstations, the ability to reuse often comes from logic rather than components (e.g., command mode, shortcuts).
- Lack of best practices: There are various practices for common parts of IDE products (menus, layout saving), but since they are not core modules, they receive less attention in the early stages of development, leading to integration difficulties.

Large front-end applications also face long-standing problems:

- Large components are hard to reuse: Business components naturally require reuse, but packaging large and flexible components is not easy. The more scenarios a component can adapt to, the more complex it becomes, making it less straightforward to use and diminishing the reuse effect.
- Large applications are hard to maintain: Adding and removing features often requires changes to multiple pieces of code, involving other parts of the logic, causing a ripple effect. Newcomers cannot quickly get up to speed.

Objectively, some existing IDE technology solutions are relatively friendly to customization and are verified feasible routes. The collision of different technical systems allows us to see the possibility of solving application construction problems, leading us to this idea:

- Combine the most familiar React technology stack with IDE construction ideas to address compatibility in IDE development and reuse capabilities of IDE-style workstations.
- Standardize the definitions and reuse methods of extension capabilities across different technical fields, with built-in best practices for common parts of IDE-style workstations.

This idea eventually materialized as Mana.

## 2. Problem Definition

### 2.1 Code Difficult to Maintain Long-Term

In many cases, we do not know how to build an application that is maintainable in the long term and has good extensibility. Existing mid-platform application development practices, as they grow larger and more complex, tend to encounter the following issues:

#### 2.1.1 Incorrect Dependency Relationships

Why do large components become difficult to reuse and maintain? We believe the root lies in the fact that under traditional development models, we have not correctly handled dependency relationships.

- Large components depend entirely on small functions

  The larger the component, the more details it has. Once these details require configuration and dynamics, configurations generated locally must be moved up to the global scope and exposed as props. When the parent component attempts to control and understand these details defined by child components, it essentially forms a global-to-local dependency.

- Parent components depend on child components

  Continuing from this perspective, JSX syntax always appears in a form of global dependency on local components. Large components need to introduce various possible subcomponents, and due to configurations exposed by subcomponents, some logic coupled with local components appears in the overall structure. The global nature of parent components causes logic from different parts of the application to converge, often resulting in maintenance disasters. This form of global dependency on local components essentially requires a god's-eye view, where users must consider every detail. Once it reaches a certain scale, it becomes difficult to understand, and with the passage of time, the forgetting curve makes it difficult to maintain.

#### 2.1.2 Unreasonable Code Organization

In general mid-platform applications, although they appear as single-page applications, the connection between functions is not strong. This is also why the micro-frontend model is popular. However, in productivity workstation applications, each part of the page is closely connected. Continuing to organize code from the UI perspective in such cases creates numerous problems.

- Leakage of Local Concepts

  When different parts of the same function are displayed in multiple places on the page, they are organized in different locations based on the UI. This requires the state, hooks, and other content serving them to be elevated to a global level or at least exposed to a location they can all access. However, they are essentially used locally. The excessive exposure of these contents leads to global concept confusion.

- Not Conducive to Division of Labor

  In large-scale applications, we cannot perform division of labor from the perspective of UI location because every location has concepts from multiple business backgrounds. However, if we continue to organize code from the UI location perspective, it will cause different teams to maintain the same code, creating maintenance issues.

#### 2.1.3 Lack of State Layering

We generally have only two types of states: local state within components and global state. This does not adequately meet business customization needs because business customization is often effective locally, and different business customizations may conflict with each other. We hope such customizations will neither pollute the global state nor affect each other.

### 2.2 Good Practices Are Hard to Replicate

Sometimes, when we see advanced IDE-style workstation features, such as command panels, dynamic shortcuts, themes, and savable layouts, we cannot quickly incorporate them:

- They come from different technology stacks and cannot be easily reused. For instance, the abstraction of savable layouts in vscode cannot serve React components.
- Some practices need to be based on standards, and the more people follow them, the better. For example, the command panel component is straightforward, but everyone must adhere to it for it to be used effectively.

## 3. How to Solve

### 3.1 Write Maintainable Code

Mana helps users write maintainable code by providing modular code organization, clear extension point definitions, layered data domains, and a dynamic view system. Compared to the component model, modularization cohesively integrates UI and logic, and with clear extension point definitions, it turns implicit interface dependencies into explicit token relationships, helping users organize code and form reasonable module dependencies. Data domains and the dynamic view system help users solve business customization challenges, allowing business customization without intruding on the original code.

#### 3.1.1 Modularization

Code should be organized based on domain modules, meaning different components, states, and logic serving the same function should be organized together. They must have a unified organizational form and external exposure standards. In this part, we borrow practices from IoC containers, requiring each element within a module to have a corresponding token as an internal identifier.

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*xHO1RoYR-6kAAAAAAAAAAAAADjOxAQ/original)

```typescript
// Module details
export default Module.create().register(CompoA, CompoB, StateA, StateB);
export CompA;
```

```typescript
// Module arbitrary combination
<Application modules={[layoutModule, BusModule, CommandModule]} />
```

#### 3.1.2 Extension Points

To avoid the problem of component configuration being passed layer by layer from global to local, we expose entities at different levels all on the same plane in the form of tokens. IoC practices provide a design idea we can learn from. We combine this approach with React's context capabilities, allowing any level of content to be replaced and configured within a context range based on conventions. On this basis, we introduce the concept of extension points to solve the one-to-many extension model.

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*gVmhS7GuA7gAAAAAAAAAAAAADjOxAQ/original)

When consuming extension points, multiple implementations can be used through competition, selection, iteration, etc., effectively solving the problem of code coupled with local components appearing in the overall structure.

#### 3.1.3 Data Domain

Modularization and extension points allow us to combine multiple modules and modify the behavior of original modules in new modules, facilitating business customization. On this basis, we add the concept of data domains to further meet diverse customization needs, allowing business customizations to be effective locally and not affect each other.

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*oDUVT6ds59AAAAAAAAAAAAAADjOxAQ/original)

The data domain in Mana relies on React Context to be effective within components and can also be managed independently. By managing data domains, we can effectively isolate the impacts of different customizations, allowing different implementations to be easily integrated, which is very effective for modules that change frequently, such as tree component customization, toolbar customization, etc.

#### 3.1.4 View System

In a system assembled from basic modules, we want the assembled modules to have a default view organization form, i.e., a default product form; we also want users to be able to flexibly modify the product form and reorganize views to serve new products. To this end, we designed a new view system that allows us to default to these flexible customization capabilities.

- View: An independent view unit that can be flexibly configured to display in various positions.
- Slot: A slot used to define configurable positions on the page.
- SlotView: A special kind of view for managing multiple views in one position.

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*Em-BSqXI9P0AAAAAAAAAAAAADjOxAQ/original)

```typescript
// Use slot for layout
<div>
  <slot name="header" />
  <div>
    <slot name="left" />
    <slot name="main" />
  </div>
</div>
// Use slotview for layout management
createSlotPreference(
  { slot:'header', view: FlexView },
  { slot:'left', view: SideTab },
  { slot:'main', view: CardTab },
)
// Place views in corresponding positions
createViewPreference(
  { slot:'left', view: FileTree },
  { slot:'main', view: Editor },
)

```

### 3.2 Composable IDE-Style Workstation Capabilities

Mana collects many mature modules from IDE-style workstation development to help IDE-style workstations start quickly.

- Command: A common execution API exposure form in IDEs that, through a unified calling standard, supports different methods such as UI, keys, plugins, etc., and can create command panels and other components based on command metadata.
- Toolbar, Menu: Through unified enable, visible, and active logic, help commands support performance in the UI, solving the problem that centralized configuration is difficult to maintain.
- Configuration: Provide a unified configuration exposure and usage standard for modules, facilitating the integration of global and local configuration items, and can create configuration panels and other supporting components based on unified configuration metadata.
- Shortcuts: Built-in support for different keyboards, unifying key mappings across different systems, providing dynamic shortcut capabilities associated with focus and context, and can create configurable shortcut panels, shortcut hit prompts, and other components based on unified shortcut metadata.
- Theme: Define basic theme metadata, provide built-in color processing capabilities, allow consumption in the form of CSS variables, CSS in JS, etc., and help other modules respond to theme states.
- Layout Saving: Provide basic interfaces that need to be followed to achieve automatic layout saving capabilities. If an application wants to achieve automatic layout saving capabilities, it can implement them by following these interfaces.

These basic modules are often less important than the core work capability modules of IDE-style workstations, so in different IDE-style workstation development processes, these support modules vary, and a lot of time is wasted on technical selection. In Mana, these capabilities are provided with standard solutions, and in the construction of other modules, we will also introduce and follow these standards.

- 🌰 The Cofine editor complies with Mana's theme and configuration capabilities, making it easy to integrate Cofine's configuration items into the reference configuration when a Mana application introduces Cofine.
- 🌰 Libro notebook is completely based on Mana's basic modules, allowing for a very fast development pace.

Mana's modules are composable. For applications, the more capabilities combined, the more focused the work will be, and the more user-friendly the overall system will become.

### 3.3 Define Your Business Abstractions

With the previous two, business applications follow the same development plan and organize the basic modules actually used in their business according to their actual business needs. They can replace component and global binary relationships with module dependency relationships, facilitating logical layering in business. Businesses can also extract their domain models and extensible abstractions in business as the cornerstone of business development, which is very helpful for the overall maintainability and scalability of business systems.

## 4. System Advantages

We have also summarized some advantages of using the entire system in practice.

### 4.1 Assembly Model

The commonly used component model is very successful, like building with Lego blocks. Since each piece has the same interface, assembling them is very free, which brings tremendous flexibility. However, when the scale becomes very large, assembling small Lego components becomes very tedious and difficult, and the system becomes fragile.

When building large applications, we want to introduce an "assembly model," characterized as follows:

- Foolproof Interface: Each module exposes different tokens externally. For the system, they are like foolproof interfaces. The interfaces exposed by a module are limited, but when interfacing, we don't need to consider their assembly methods anymore. These specialized interfaces can only operate in the way the interface definer expects.
- Automatic Assembly: Since each module is foolproof, we can achieve automatic assembly. The process of combining modules is merely listing them.

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*1l7hT6zqrCMAAAAAAAAAAAAADjOxAQ/original)

### 4.2 Incremental Development

Modules in the Mana system have strong secondary development capabilities, allowing us to modify the behavior of basic modules using additional code, not only adding features but also removing and modifying them, i.e., incremental development mode.

- High Development Efficiency: With the management of data domains, new capabilities can be developed quickly without worrying about external impacts.
- Promote Upstream Updates: Since downstream modules can easily perform secondary development on upstream module capabilities, when upstream modules do not meet usage scenarios, we can first implement them in our modules and then feedback to the upstream after they mature.

A practical example is in the construction of Libro notebook, where multiple products have introduced Libro's core modules, and then developed their cells and file read/write services in an incremental development form. In a productivity context, you might have to deal with different read/write methods, such as reading actual files and fake files in databases, and then we need to continue packaging it into modules that can be integrated into openSumi. These customizations inevitably lead to a bloat in core packages. But currently, the Libro core package has hardly expanded its definitions, and the addition of new modes does not affect the original chain in any way.

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*CZxfTKBI7mYAAAAAAAAAAAAADjOxAQ/original)

### 4.3 Domain Abstraction

Based on business capability modularization, it is often matched with the domain model of the application in practice. The extension point definitions allow us to have a comprehensive understanding of what horizontal extension capabilities a system has. This makes us more focused on domain models and abstract interfaces than ever before. The contrast and differences in domain models between front-end and back-end also make it easier for the front-end and back-end to understand each other's capabilities in overall design (privacy computing platform case). For businesses, the stability of core models far exceeds that of UI stability, providing a stable pillar for application construction.

## 5. System Design

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*PVXyQ51zfOYAAAAAAAAAAAAADjOxAQ/original)

Mana can be divided into three layers: General Layer, Specification Layer, and Practice Layer:

- General Layer: Mainly includes dependency injection container and reactive state management, which are basic tool modules in Mana that can be used independently.
  - Dependency Injection Container: Mana requires a container that can manage tokens and perform registration, replacement, collection, etc. The current selection is mainly related to the need to be compatible with IDE modules in the early stages of Mana construction. On this basis, we have added dynamic modules, declarative usage methods, etc.
  - Reactive State: Mana's data changes and consumers are relatively complex. On one hand, the data system needs to be used independently of the UI, and on the other hand, abstract definitions of extension points include behavior abstractions, which are the basis for optimizing this part. We decided early on to base it on reactive state management.
- Specification Layer: Mana provides users with what constitutes a module, what constitutes an extension point, and what constitutes a view, and constrains users' writing methods. This part is key to Mana solving application construction problems.
- Practice Layer: Built-in various commonly used modules for IDE-style workstations, providing best practices for product development.
