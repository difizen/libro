import type { EditorState } from '@codemirror/state';
import { Facet, combineConfig } from '@codemirror/state';

import type { Completion, CompletionSource } from './completion.js';

export interface CompletionConfig {
  /// When enabled (defaults to true), autocompletion will start
  /// whenever the user types something that can be completed.
  activateOnTyping?: boolean;
  /// By default, when completion opens, the first option is selected
  /// and can be confirmed with
  /// [`acceptCompletion`](#autocomplete.acceptCompletion). When this
  /// is set to false, the completion widget starts with no completion
  /// selected, and the user has to explicitly move to a completion
  /// before you can confirm one.
  selectOnOpen?: boolean;
  /// Override the completion sources used. By default, they will be
  /// taken from the `"autocomplete"` [language
  /// data](#state.EditorState.languageDataAt) (which should hold
  /// [completion sources](#autocomplete.CompletionSource) or arrays
  /// of [completions](#autocomplete.Completion)).
  override?: readonly CompletionSource[] | null;
  /// Determines whether the completion tooltip is closed when the
  /// editor loses focus. Defaults to true.
  closeOnBlur?: boolean;
  /// The maximum number of options to render to the DOM.
  maxRenderedOptions?: number;
  /// Set this to false to disable the [default completion
  /// keymap](#autocomplete.completionKeymap). (This requires you to
  /// add bindings to control completion yourself. The bindings should
  /// probably have a higher precedence than other bindings for the
  /// same keys.)
  defaultKeymap?: boolean;
  /// By default, completions are shown below the cursor when there is
  /// space. Setting this to true will make the extension put the
  /// completions above the cursor when possible.
  aboveCursor?: boolean;
  /// This can be used to add additional CSS classes to completion
  /// options.
  optionClass?: (completion: Completion) => string;
  /// By default, the library will render icons based on the
  /// completion's [type](#autocomplete.Completion.type) in front of
  /// each option. Set this to false to turn that off.
  icons?: boolean;
  /// This option can be used to inject additional content into
  /// options. The `render` function will be called for each visible
  /// completion, and should produce a DOM node to show. `position`
  /// determines where in the DOM the result appears, relative to
  /// other added widgets and the standard content. The default icons
  /// have position 20, the label position 50, and the detail position
  /// 80.
  addToOptions?: {
    render: (completion: Completion, state: EditorState) => Node | null;
    position: number;
  }[];
  /// The comparison function to use when sorting completions with the same
  /// match score. Defaults to using
  /// [`localeCompare`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare).
  compareCompletions?: (a: Completion, b: Completion) => number;
  /// By default, commands relating to an open completion only take
  /// effect 75 milliseconds after the completion opened, so that key
  /// presses made before the user is aware of the tooltip don't go to
  /// the tooltip. This option can be used to configure that delay.
  interactionDelay?: number;
}

export const completionConfig = Facet.define<
  CompletionConfig,
  Required<CompletionConfig>
>({
  combine(configs) {
    return combineConfig(
      configs,
      {
        activateOnTyping: true,
        selectOnOpen: true,
        override: null,
        closeOnBlur: true,
        maxRenderedOptions: 100,
        defaultKeymap: true,
        optionClass: () => '',
        aboveCursor: false,
        icons: true,
        addToOptions: [],
        compareCompletions: (a, b) => a.label.localeCompare(b.label),
        interactionDelay: 75,
      },
      {
        defaultKeymap: (a, b) => a && b,
        closeOnBlur: (a, b) => a && b,
        icons: (a, b) => a && b,
        optionClass: (a, b) => (c) => joinClass(a(c), b(c)),
        addToOptions: (a, b) => a.concat(b),
      },
    );
  },
});

function joinClass(a: string, b: string) {
  return a ? (b ? a + ' ' + b : a) : b;
}
