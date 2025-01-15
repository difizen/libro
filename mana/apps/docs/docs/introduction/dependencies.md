---
title: Dependency management
order: 9

nav:
  title: Introduction
---

Frontend development is becoming increasingly complex, from Gmail as an engineering model to Office online and now WebIDE for everyone. Our focus in engineering has become more macroscopic, evolving from closures and data flow to layering, modularization, and micro-frontends. Many concepts from traditional software engineering are repeatedly practiced and innovated in the frontend. Mastering methods is less important than mastering principles, and understanding principles is less important than understanding ideas. Today, I want to discuss the most basic concepts, starting with the concept of dependency, to explore frontend engineering practices.

# Preface

Why do we have engineering? Because there is more code, and projects are getting larger, we categorize strategies to cope with these situations as engineering methods. Why do more code and larger projects become a problem, and why do we need to address this? Because humans are involved in engineering, and the [short-term memory](https://en.wikipedia.org/wiki/Short-term_memory) of the human brain can only handle about seven objects. Therefore, when the information volume of a system increases, we need methods to effectively manage this information. Thus, thinking about engineering methods is essentially thinking about human cognitive patterns. If you have read "Coders at Work," you might find that these experts often do not care much about engineering methods. Within the cognitive space that human thinking can support, engineering methods are not important. For most people, when faced with a pile of disordered information, we are at a loss; but when faced with organized and regular information, we can retrieve it efficiently. We naturally rely on summarizing rules and deductive reasoning to understand the world. The same information, organized in different ways, leads to different levels of acceptance. Information that we can efficiently receive often exhibits characteristics that align with cognitive patterns, such as classification and layering. These structures help us judge information from different perspectives, form habits, and carry expectations, thereby better mastering and using them. The human brain is limited, and engineering methods enable our brains to effectively handle the issue of information volume, which is why extensibility is an eternal theme. Whether it's data flow control or modularization and micro-frontends, they all aim to help people involved in engineering understand design ideas, reduce maintenance costs, and combat the forgetting curve. When our mental energy is no longer spent organizing information, we can delve deeper into a field, explore its depths, and extend our chains of reasoning.

# The Essence of Dependency

The operation of a program relies on executing statements one by one. We aggregate multiple statements into methods, and then methods call each other, resulting in dependencies. Calling a method means depending on it. In fact, the execution order of these statements is also a dependency condition. In modern software systems, we generally consider `calls` as the root of dependency generation. From this perspective, dependencies are unavoidable unless the code is not executed, in which case it will inevitably form dependency relationships. Dependencies generated through calls usually manifest in the code. The languages we use generally have explicit dependency declaration statements, such as `import`. However, in actual programs, calling a program does not necessarily have to follow the formal language and engineering tool conventions. Broadly speaking, we might say frontend code depends on backend interfaces, but we cannot `import` backend interfaces because languages and engineering systems are not interoperable. So, we call through the textual `http protocol`. On a smaller scale, when using data flow solutions like `redux`, calling methods also requires textual agreements like `action`. These dependencies are not reflected in the code and do not affect packaging, but they have a real impact on the code of the user, requiring us to consult API documentation or view type definitions to complete the call, which is also a form of dependency.

```typescript
import func
fetch('/func')
store.dispatch({type:'func'})
```

The dependencies we focus on are not the specific code syntax but the mental dependencies in a practical sense. Programs with multiple execution steps will inevitably generate internal dependencies due to existing agreements. These agreements may sometimes be explicitly defined, while simpler ones might be temporarily stored in the mind. These agreements are the essence of dependencies.

# Forms of Dependency

## The Simplest Dependency

The simplest dependency relationship is A depends on B. When we import a method from one file into another, we create this kind of dependency. The question is, under what circumstances do we establish such a dependency?

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*gVb0QI9FMUcAAAAAAAAAAAAADjOxAQ/original)

### Extracting Commonality

The most primitive scenario is when a program's steps increase, we separate the repeated parts into an independent process that can be `called`. In this process, dependency is formed, and the dependency relationship at this time is the form of A depends on B.

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*eispSob6cMgAAAAAAAAAAAAADjOxAQ/original)

This is a very common process, so common that we almost do it without thinking. Often, the internal drive for handling it this way is the [DRY principle](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself). Establishing this kind of dependency also simplifies the program's information volume, making it easier for us to understand the program. This process is essentially about extracting common parts.

### Decomposing Parts

In some scenarios, we establish such a dependency relationship not to extract commonality but, for example, to separate a popup in a page into an independent component. What is the essence of these operations? Looking at the code forming parts A and B in the above figure, they are not equivalent. The generated dependency is unidirectional. Here, B is actually a part of A. The relationship is always one of whole and part. Therefore, this relationship also appears in our process of decomposing parts, which is more common in code than extracting commonality.

The process from page to component is generally one of decomposing parts and extracting commonality. In the figure below, `Item` is the extracted commonality, while others are decomposed parts.

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*JVu-Trzxy6AAAAAAAAAAAAAADjOxAQ/original)

## Dependency and Control

When a dependency relationship is established by decomposing parts, it should mean that the decomposed part replaces all the original details of that part. Extracting commonality should be when that part is used repeatedly. In this process, the whole should control the part, and then the part controls even smaller parts, thereby achieving a step-by-step thinking method. But our actual code is not like this. For example, in the process of breaking down a page into components, we often generate a concept like `layout`. The diagram above might be decomposed into the following form:

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*kYamRrUhDRwAAAAAAAAAAAAADjOxAQ/original)

All layout details are masked by `layout`, but `App` directly depends on the details displayed within the layout—it directly manages the content of `Content`, which is `Item`. I'm sure the corresponding code is familiar to everyone:

```typescript
const App = () => {
  return (
    <Layout>
      <Item />
      <Item />
      <Item />
    </Layout>
  );
};
```

For `Layout`, from the overall-part structure, the `Item` that should have been controlled by it becomes `Children` obtained from the context. In our design, we handed over this part of the dependency that belongs to `Layout` to upper-level control. What does this operation achieve? Greater reusability of `Layout`, which is a kind of intermediate-level reusability.

This is not an uncommon design. Various Props exposed on components, especially component-type Props; parameters designed for functions, especially function-type parameters; attributes designed in Classes, especially Class-type attributes. The reason driving us to design this way is the need to extract a unit in the dependency relationship that is at an intermediate level. These forms of design, which can be controlled by the upper layer, are often in pursuit of greater flexibility and reusability. And the essence of this design is [Inversion of Control](https://en.wikipedia.org/wiki/Inversion_of_control).

The definition of Inversion of Control on Wiki is relatively narrow, mainly focusing on the reversal of object creation within the object-oriented system. I think the generalization here is applicable. By inverting controls, parts hand over more control rights to gain greater flexibility and reusability, allowing us to decompose and reuse dependencies that are at intermediate levels.

### Dependency During Inversion of Control

At this time, if we look at the dependency relationship formed from a more detailed perspective, we will find that while parts are handing over control rights, they will certainly impose their constraints. The children of a component are just coincidentally omitted due to the framework's definition, but when we pass components through props, or when this inversion occurs in a function or class, these constraints are often explicit, and they will eventually form the following dependency structure. At runtime, the agreement B relies on will become an entity, so B is the intermediate layer in the logical structure.

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*lQ8HQ4XpoL4AAAAAAAAAAAAADjOxAQ/original)

If you're familiar with the [SOLID](https://en.wikipedia.org/wiki/SOLID) principles, you'll find that for the Dependency Inversion Principle "High-level modules should not depend on low-level modules. Both should depend on abstractions," we satisfy the latter part.

## Dependency and Extensibility

Suppose a scenario where the layout needed by our page is no longer singular but multiple, showing differently under different routes. How should we design it?

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*37s2QqfeyucAAAAAAAAAAAAADjOxAQ/original)

The simplest way is to have the dependency structure as shown above, where all possible layouts appear as dependencies of the App, and then the App decides which layout to use based on context information such as routes. However, we can clearly see the issue of extensibility here, meaning when I need to add a layout, I need to add both the layout code and modify the App code. If you're familiar with the [SOLID](https://en.wikipedia.org/wiki/SOLID) principles, this violates the [Open/Closed Principle](https://en.wikipedia.org/wiki/Open%E2%80%93closed_principle). So how can we make layout extension easier and prevent the App from changing with layout changes? We need to separate the logic about layout handling within the App, and then you will find that the separated logic is actually only related to interfaces and context. Actually, we just need to materialize the interface, allowing it to provide constraints while collecting implementations of these constraints.

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*e5FRRKHXtOYAAAAAAAAAAAAADjOxAQ/original)

The specific implementation can provide a `manager` as a registration center, where each `layout` registers its information into the `manager`, and then the `App` only relies on the `manager` to get the Layout needed for the current use. If you compare it with the implementation of routing in umi, you will find that umi writes the information corresponding to the layout and routing into a configuration, which is then read by the manager in umi and applied in the App. Due to the framework's conventions on engineering structure, umi omits the code for manually registering Layouts. In fact, this is the core difference between various implementations of different extensions, in how they collect abstract implementations that meet constraints.

In addition to registration and configuration methods, we can also use dependency injection containers and other ways to collect them. The writing methods vary, but they all aim to accomplish the same thing. At this point, we can finally write a common dependency relationship that satisfies extensibility.

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*aD5_RbM22KgAAAAAAAAAAAAADjOxAQ/original)

In most cases, our code is a combination of the previous forms of dependency, stacking the entire project like Lego blocks. General dependency forms, and a certain degree of inversion of control, are relatively unconscious in the code-writing process because their driver comes from solving current problems. In contrast, completing extensibility designs through control often requires conscious design because the problem it solves is about future maintenance, and the current code does not decrease and may even increase.

# Coupling and Cohesion

In fact, the concept of [coupling](<https://en.wikipedia.org/wiki/Coupling_(computer_programming)>) is closely related to dependency, referring to the degree of information or parameter dependency between modules in a program. So wherever there is dependency, there is coupling. However, it is important to note that coupling is a subject-verb equal concept, whereas dependency is directional. So often, saying A couples B is less precise than saying A depends on B. Coupling has multiple forms of expression, with coupling levels ranging from high to low being content coupling, common coupling, control coupling, stamp coupling, data coupling, and non-direct coupling. The ways dependencies are generated that we've mentioned often match one form of coupling, such as extracting commonality, which often corresponds to common coupling. Coupling is often an evaluation of the relationship between modules, so what we pursue is low coupling, which actually means minimizing inter-module dependencies. Here, "minimizing" is substantive, not formal. It refers to the descriptive capability of the exposed contract, not the number of contracts. Therefore, when dependencies arise between two modules, we should make this connection simple. When it is a type constraint, it should also be the simplest type constraint, which corresponds to the [Interface Segregation Principle](https://en.wikipedia.org/wiki/Interface_segregation_principle) in SOLID.

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*Yx4DS7jom3QAAAAAAAAAAAAADjOxAQ/original)

At the module level, we can further discuss cohesion. High cohesion and low coupling go hand in hand. In fact, a program always has tightly coupled and loosely coupled parts. When we compress tightly coupled parts together to form a module, dependencies between these modules decrease, and low coupling appears. At this time, the modules we have divided out are highly cohesive. Cohesion also has many forms of expression, with levels of cohesion ranging from low to high being accidental cohesion, logical cohesion, temporal cohesion, procedural cohesion, communicational cohesion, sequential cohesion, and functional cohesion. Cohesion is the other side of coupling, and I won't delve into the scholarly introduction of different cohesion forms here, as I don't agree with some of them...

# Common Frontend Scenarios

## Routing

In fact, we have already given a routing example in the previous example. Let's expand on it. For routing, it needs to handle not just the dynamism of `layout` but the combination of `layout``content`, and even nesting.

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*nrCTRKGvaWcAAAAAAAAAAAAADjOxAQ/original)

If you look at the code, we may not explicitly quote anything on the page. But in reality, the framework completes it for us, and when we write page-level components, we inevitably use Props from the Route definition, which is actually still a form of dependency.

## Stateless

Since the rise of functional programming, statelessness has become increasingly popular. Why do we like statelessness? A stateless function can guarantee stable performance when called by different dependents. From a dependency perspective, if a dependency is stateless, it will have a small side effect when extracted as a common dependency, and practical examples like utility functions won't burden us with extraction. However, if we extract a common dependency that is stateful, its runtime performance will have many uncertainties. These uncertainties are what we dislike and are the risks of common coupling.

## Events

The event model is also a common means of managing dependencies. For example, when implementing modules bound to each other in a chain, because dependency direction can only be one way, assuming A depends on B, an event can be implemented in B to allow B to affect A. Here, it can actually be considered that A/B both depend on the abstract definition of the event, only that this definition is merged into B.

![](https://mdn.alipayobjects.com/huamei_hdnzbp/afts/img/A*mzadQZ0moWkAAAAAAAAAAAAADjOxAQ/original)

# Summary

Dependencies are inevitable. In the case of unchanged code entities, we can organize them through different forms of dependency relationships. The purpose of adjusting these dependency relationships should be to aggregate these entities into different modules, achieving high cohesion within modules and low coupling between modules, thereby enhancing the efficiency of information reception by those involved in engineering and better maintaining and extending the engineering project.
