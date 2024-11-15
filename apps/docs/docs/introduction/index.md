---
nav:
  title: Introduction

title: Introduction
order: 1
---

# What is libro?

libro is a notebook product solution dedicated to offering highly open integration and customization capabilities. It provides an experience beyond native Jupyter, integrates powerful AI capabilities, supports kernel-level extensions, and helps developers easily customize notebook products to build top-notch AI and data science development solutions.

🌟 GitHub Address:
https://github.com/difizen/libro

🌟 Official Website:
https://libro.difizen.net/

# Why create libro?

In the AI and data science fields, notebooks have become an essential tool for researchers and developers in their daily work. Our team serves an internal AI platform, where more than half of the users utilize notebooks as part of their modeling and development workflow.

While many users are using notebooks, they also have higher expectations, such as integrating R&D tools for SQL to provide a unified data processing and model training experience, large model demo presentations, better version management, and code review (CR).

Meeting these requirements on the existing Jupyter system would incur high compatibility costs, making it difficult for us to continuously optimize the product experience and add new features. Therefore, we developed our self-researched notebook — libro, hoping it will:

- Provide kernel-level extension capabilities
- Support different forms, allowing easy embedding into various scenarios
- Offer a better interactive editing experience
- Provide high-quality peripheral functions

We are launching libro as open source, hoping to receive feedback from different perspectives through open-source methods, helping more people who use and build notebook products, fostering communication and collaboration to jointly promote and improve libro.

# What features does libro have?

libro is a turnkey product solution, allowing users to freely combine libro native modules based on their needs. It offers flexible scenario customization capabilities and is built-in with rich peripheral functions.
<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/libro_feature.png" width="1000px"/>

## Easy Customization

libro has developed an open set of UI and execution kernel customizations, allowing all levels of modules to be redeveloped.

It supports customization of various forms, supports cells in different forms such as SQL and Prompt, can be used solely as a document editor, or in report form, making it convenient for demo presentations anytime.

Powerful kernel customization capabilities enable libro to support native Jupyter execution capabilities while also facilitating customization for SQL execution environments like ODPS, multi-node debugging execution environments for privacy computing scenarios, etc.
<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/sql_prompt.png" width="1000px"/>

## Rich Features

libro provides complete notebook capabilities and is equipped with many rich feature sets, such as supporting intelligent assistant AI dialogue functions; offering better Python code suggestions, completion, formatting, and definition jump functions; supporting cell-level code version Diff capabilities; supporting lightweight application forms, combining interactive controls to dynamically generate reports, etc.

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/copilot_tip.png" width="1000px"/>

<img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/diff_app.png" width="1000px"/>

# The architecture design of libro

libro adopts layered construction:

- SDK Layer: Provides backend services and language services, with built-in AI capabilities and parameterized notebook calling SDK.
- Framework Layer: Provided by the modular and extensible front-end framework mana, meeting extensibility while providing basic modules such as shortcuts, themes, menus, commands, configuration, and toolbars.
- Execution Layer: Since different scenarios, different versions of Jupyter services, and even non-Jupyter custom execution methods need to be compatible, the execution layer is more about defining behavior specifications rather than providing specific implementations.
- View Layer: The view layer is the most flexible and abstract layer, offering extensible cells and output types; it is built-in with native Jupyter cells and native outputs.
- Extension Layer: Provides high-quality peripheral functions based on the core modules of libro.
  <img src="https://raw.githubusercontent.com/wiki/difizen/libro/assets/technical _architecture.png" width="1000px"/>

# Facing the Future

libro will continue to leverage its features of flexible customization and easy integration to explore more usage scenarios for notebook-like products. We will continuously increase support for different runtimes and introduce controls with better interactive experiences, making libro the best-experienced notebook product.

libro will continue to explore application scenarios combined with large models, allowing users to have a more intelligent programming experience with large models, making programming with libro as easy as writing documents. At the same time, libro will play its role in the rich interaction in the development system of large model applications, becoming a helpful assistant in developing large model capabilities.

We welcome developers from different scenarios to join us in building the libro project. Here is the link to the libro open-source project again; if you also like this project, feel free to give us a star on GitHub 🌟🌟🌟.

https://github.com/difizen/libro
