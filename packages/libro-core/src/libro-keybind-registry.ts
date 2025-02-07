import { KeybindingRegistry, KeyCode } from '@difizen/libro-common/mana-app';
import { singleton } from '@difizen/libro-common/mana-app';

@singleton({ token: KeybindingRegistry })
export class LibroKeybindRegistry extends KeybindingRegistry {
  override run(event: KeyboardEvent) {
    const keyCode = KeyCode.createKeyCode(event, 'code');
    if (KeyCode.parse('esc').equals(keyCode)) {
      /* Keycode is only a modifier, next keycode will be modifier + key.
            Ignore this one.  */
      if (keyCode.isModifierOnly()) {
        return;
      }

      this.keyboardLayoutService.validateKeyCode(keyCode);
      this.keySequence.push(keyCode);
      const match = this.matchKeybinding(this.keySequence, event);

      if (match && match.kind === 'partial') {
        /* Accumulate the keysequence */
        // TODO: The effective scope of of prevent propagation.
        const {
          preventDefault = this.preventDefault,
          stopPropagation = this.stopPropagation,
        } = match.binding;
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }
        (this as any).emitter.fire(match);
      } else {
        if (match && match.kind === 'full') {
          this.executeKeyBinding(match.binding, event);
        }
        this.keySequence = [];
        (this as any).emitter.fire(match);
      }
    }
    super.run(event);
  }
}
