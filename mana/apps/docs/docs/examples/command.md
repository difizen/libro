---
title: Commands
order: 1

nav:
  title: Example
  order: 3
---

# Commands

The command system is a very fundamental system that supports a manager for callable methods. By standardizing command registration, we address the unified response across different UI entry points such as shortcuts, menus, toolbars, and command panels. This also provides a simpler internal method invocation entry point for external systems of plugins.

## Simple Usage

<code src="../../src/command/simple"></code>

Users can complete the registration and consumption of commands using `CommandRegistry`. We also provide the `CommandContribution` extension point.

```typescript
export type CommandContribution = {
  registerCommands: (commands: CommandRegistry) => void;
};
```

We offer two methods of registering commands on the `CommandRegistry`

```typescript
registerCommand(command: Command, handler?: CommandHandler): Disposable
registerCommandWithContext<T = any>(command: Command, ctx: T, handler?: CommandHandlerWithContext<T>): Disposable
```
