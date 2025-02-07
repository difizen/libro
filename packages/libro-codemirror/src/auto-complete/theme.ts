import { EditorView } from '@codemirror/view';
import { l10n } from '@difizen/libro-common/l10n';

export const enum Info {
  Margin = 30,
  Width = 400,
}

export const baseTheme = EditorView.baseTheme({
  '.cm-tooltip.cm-tooltip-autocomplete': {
    '& > ul': {
      fontFamily: 'monospace',
      whiteSpace: 'nowrap',
      overflow: 'hidden auto',
      maxWidth_fallback: '700px',
      maxWidth: 'min(700px, 95vw)',
      minWidth: '250px',
      maxHeight: '10em',
      listStyle: 'none',
      margin: 0,
      padding: 0,

      '& > li': {
        overflowX: 'hidden',
        textOverflow: 'ellipsis',
        cursor: 'pointer',
        padding: '1px 3px',
        lineHeight: 1.2,
      },
    },
  },

  '&light .cm-tooltip-autocomplete ul li[aria-selected]': {
    background: '#17c',
    color: 'white',
  },

  '&dark .cm-tooltip-autocomplete ul li[aria-selected]': {
    background: '#347',
    color: 'white',
  },

  '.cm-completionListIncompleteTop:before, .cm-completionListIncompleteBottom:after': {
    content: '"···"',
    opacity: 0.5,
    display: 'block',
    textAlign: 'center',
  },

  '.cm-tooltip.cm-completionInfo': {
    position: 'absolute',
    padding: '3px 9px',
    width: 'max-content',
    maxWidth: `${Info.Width}px`,
    boxSizing: 'border-box',
    maxHeight: '500px',
    overflow: 'auto',
  },

  '.cm-completionInfo.cm-completionInfo-left': { right: '100%' },
  '.cm-completionInfo.cm-completionInfo-right': { left: '100%' },
  '.cm-completionInfo.cm-completionInfo-left-narrow': { right: `${Info.Margin}px` },
  '.cm-completionInfo.cm-completionInfo-right-narrow': { left: `${Info.Margin}px` },

  '&light .cm-snippetField': { backgroundColor: '#00000022' },
  '&dark .cm-snippetField': { backgroundColor: '#ffffff22' },
  '.cm-snippetFieldPosition': {
    verticalAlign: 'text-top',
    width: 0,
    height: '1.15em',
    display: 'inline-block',
    margin: '0 -0.7px -.7em',
    borderLeft: '1.4px dotted #888',
  },

  '.cm-completionMatchedText': {
    textDecoration: 'underline',
  },

  '.cm-completionDetail': {
    marginLeft: '0.5em',
    fontStyle: 'italic',
  },

  '.cm-completionIcon': {
    fontSize: '90%',
    width: '.8em',
    display: 'inline-block',
    textAlign: 'center',
    paddingRight: '.6em',
    opacity: '0.6',
  },

  '.cm-completionIcon-function, .cm-completionIcon-method': {
    '&:after': { content: "'ƒ'" },
  },
  '.cm-completionIcon-class': {
    '&:after': { content: "'○'" },
  },
  '.cm-completionIcon-interface': {
    '&:after': { content: l10n.t("'◌'") },
  },
  '.cm-completionIcon-variable': {
    '&:after': { content: l10n.t("'𝑥'") },
  },
  '.cm-completionIcon-constant': {
    '&:after': { content: l10n.t("'𝐶'") },
  },
  '.cm-completionIcon-type': {
    '&:after': { content: l10n.t("'𝑡'") },
  },
  '.cm-completionIcon-enum': {
    '&:after': { content: "'∪'" },
  },
  '.cm-completionIcon-property': {
    '&:after': { content: "'□'" },
  },
  '.cm-completionIcon-keyword': {
    '&:after': { content: "'🔑\uFE0E'" }, // Disable emoji rendering
  },
  '.cm-completionIcon-namespace': {
    '&:after': { content: l10n.t("'▢'") },
  },
  '.cm-completionIcon-text': {
    '&:after': { content: "'abc'", fontSize: '50%', verticalAlign: 'middle' },
  },
});
