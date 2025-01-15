---
title: 命令
order: 7
nav:
  title: 示例
  order: 3
---

# 命令

命令系统是非常基础的一个系统，其本身支持对可调用方法的管理器，我们通过统一的命令注册，来解决快捷键、菜单、工具栏、命令面板等不同 UI 入口的统一响应问题，也给插件得外部系统更浅的内部方法调用入口。

## 简单使用

<code src="../../src/command/simple"></code>

用户可以 `CommandRegistry` 完成命令的注册和消费，我们也提供了 `CommandContribution` 扩展点。

```typescript
export type CommandContribution = {
  registerCommands: (commands: CommandRegistry) => void;
};
```

我们在 `CommandRegistry` 上提供两种注册命令的形式

```typescript
registerCommand(command: Command, handler?: CommandHandler): Disposable
registerCommandWithContext<T = any>(command: Command, ctx: T, handler?: CommandHandlerWithContext<T>): Disposable
```
