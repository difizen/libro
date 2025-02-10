---
title: Custom Keyboard Shortcuts
order: 3
---

# Keyboard Shortcuts

Keyboard shortcuts are crucial in a developer's workflow, significantly enhancing productivity. As an interactive notebook application, libro offers a rich set of keyboard shortcuts to assist users in their tasks. This article will guide you on how to develop custom keyboard shortcuts.

## Supported Keyboard Shortcuts

Keyboard shortcuts consist of modifier keys and actual key presses. Below is a list of supported modifier keys and keys when developing custom keyboard shortcuts in libro.

### Supported Modifier Keys

| Platform | Modifier Keys              |
| :------- | :------------------------- |
| macOS    | Ctrl+, Shift+, Alt+, Cmd+  |
| Windows  | Ctrl+, Shift+, Alt+, Win+  |
| Linux    | Ctrl+, Shift+, Alt+, Meta+ |

### Supported Keys

In addition to modifier keys, the following actual keys are also supported:

- Function keys: f1-f19
- Letter keys: a-z
- Number keys: 0-9
- Symbol keys: ` `, `-`, `=`, `[`, `]`, `\`, `;`, `'`, `,`, `.`, `/`
- Arrow keys: left, up, right, down
- Navigation keys: pageup, pagedown, end, home
- Other common keys: tab, enter, escape, space, backspace, delete
- Other function keys: pausebreak, capslock, insert
- Numeric keypad: numpad0-numpad9, numpad_multiply, numpad_add, numpad_separator, numpad_subtract, numpad_decimal, numpad_divide

These keys and modifier keys can be combined to create custom keyboard shortcut combinations.

## How to Register Custom Keyboard Shortcuts

In libro, keyboard shortcuts are implemented through a command system. Each keyboard shortcut is bound to a command, which is executed when the shortcut is pressed.

### Keyboard Shortcut Definition

The default registered keyboard shortcuts are associated with commands, with the basic components of a keyboard shortcut definition including:

- **id**: A unique identifier for the command.
- **keybind**: The keyboard shortcut bound to the command, provided in the following ways:
  - Single key: `keybind: 'd'`, a single key activates the shortcut.
  - Combination keys: `keybind: 'ctrlcmd+shift+d'`, multiple keys activate the shortcut simultaneously.
  - Multiple sets of keys: `keybind: ['shift+q', 'shift+w']`, one command can be bound to multiple sets of keys, and activating any one set will trigger the command.
  - Consecutive keys: `keybind: 'j j'`, keys must be pressed consecutively to activate.
- **when**: When a command is bound to a keyboard shortcut, this field is used to determine the conditions under which the shortcut is active. If the command definition includes `when: 'commandMode'`, it means the shortcut only works in command mode and not in edit mode; conversely, if this field is not included, there are no conditions limiting the shortcut's activation in command mode. This design primarily considers preventing unintended activation of shortcuts during editing.

#### Example

```typescript
export const LibroDemoKeybindCommand = {
  demokeybindCommand1: {
    id: 'demo:libro-keybind-command-1',
    keybind: 'ctrlcmd+shift+d',
  },
  demokeybindCommand2: {
    id: 'demo:libro-keybind-command-2',
    keybind: 'shift+d',
    when: 'commandMode',
  },
  demokeybindCommand3: {
    id: 'demo:libro-keybind-command-3',
    keybind: ['shift+q', 'shift+w'],
  },
  demokeybindCommand4: {
    id: 'demo:libro-keybind-command-4',
    keybind: 'w w',
  },
};
```

### Keyboard Shortcut Registration Implementation

1. Implement the command's handler (`execute`, `isEnabled`) to control the behavior of the command associated with the shortcut.
2. Register the keyboard shortcut. libro uses a dependency injection mechanism to manage the registration of shortcuts, so you need to create a keyboard shortcut extension class and register the shortcuts within this class. The keyboard shortcut extension class implements the `KeybindingContribution` interface, which provides the `registerKeybindings` method specifically for registering shortcuts. You also need to use the `registerKeybinds` method from `LibroCommandRegister` to ensure that the shortcut is only active when the focus is on the current libro editor and under the logical condition of command mode.
3. Register the newly added keyboard shortcut extension class in the mana module.

```typescript
import { AppExtention } from '@difizen/libro-jupyter';
import { LibroEditorModule } from '../libro-editor/module';
import { LibroDemoKeybindingContribution } from './libro-demo-keybind-contribution';

const { ManaModule } = AppExtention;
export const LibroKeybindDemoModule = ManaModule.create()
  .register(LibroDemoKeybindingContribution)
  .dependOn(LibroEditorModule);
```

#### Example

```typescript
import { LibroCommandRegister, AppExtention, AppIOC } from '@difizen/libro-jupyter';
import { LibroDemoKeybindCommand } from './libro-demo-keybind-command';

const { inject, singleton } = AppIOC;
const {
  KeybindingRegistry,
  KeybindingContribution,
  CommandContribution,
  CommandRegistry,
} = AppExtention;
@singleton({ contrib: [KeybindingContribution, CommandContribution] })
export class LibroDemoKeybindingContribution
  implements KeybindingContribution, CommandContribution
{
  @inject(LibroCommandRegister) protected readonly libroCommand: LibroCommandRegister;

  registerKeybindings(keybindings: KeybindingRegistry) {
    this.libroCommand.registerKeybinds(keybindings, LibroDemoKeybindCommand);
  }

  registerCommands(command: CommandRegistry): void {
    this.libroCommand.registerLibroCommand(
      command,
      LibroDemoKeybindCommand['demokeybindCommand1'],
      {
        execute: async () => {
          console.log('Shortcut demo example 1 executed');
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      LibroDemoKeybindCommand['demokeybindCommand2'],
      {
        execute: async () => {
          console.log('Shortcut demo example 2 executed');
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      LibroDemoKeybindCommand['demokeybindCommand3'],
      {
        execute: async () => {
          console.log('Shortcut demo example 3 executed');
        },
      },
    );
    this.libroCommand.registerLibroCommand(
      command,
      LibroDemoKeybindCommand['demokeybindCommand4'],
      {
        execute: async () => {
          console.log('Shortcut demo example 4 executed');
        },
      },
    );
  }
}
```
