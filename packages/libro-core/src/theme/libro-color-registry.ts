import type { ColorRegistry } from '@difizen/mana-app';
import { Color, ColorContribution } from '@difizen/mana-app';
import { singleton } from '@difizen/mana-app';

@singleton({ contrib: ColorContribution })
export class LibroColorRegistry implements ColorContribution {
  registerColors(colors: ColorRegistry): void {
    colors.register(
      // #region antd variable
      {
        id: 'libro.warning.background',
        defaults: { dark: '#A9611466', light: '#FFFBE6' },
        description: '',
      },
      {
        id: 'libro.drag.hover.line.color',
        defaults: { dark: '#467DB0', light: '#BFE0FF' },
        description: '',
      },
      {
        id: 'libro.background',
        defaults: { dark: '#1f2022', light: '#ffffff' },
        description: '',
      },
      {
        id: 'libro.popover.background.color',
        defaults: { dark: '#2f3032', light: '#ffffff' },
        description: '',
      },
      {
        id: 'libro.menu.hover.color',
        defaults: { dark: '#515359', light: '#EBF6FF' },
        description: '',
      },
      {
        id: 'libro.dropdown.icon.color',
        defaults: {
          dark: Color.rgba(255, 255, 255, 0.3),
          light: Color.rgba(0, 0, 0, 0.2),
        },
        description: '',
      },
      {
        id: 'libro.input.background',
        defaults: { dark: '#19191B', light: '#F4F6FB' },
        description: '',
      },
      {
        id: 'libro.text.default.color',
        defaults: { dark: '#e3e4e6', light: '#000000' },
        description: '',
      },
      {
        id: 'libro.text.tertiary.color',
        defaults: { dark: '#bdc0c4', light: '#B8BABA' },
        description: '',
      },
      {
        id: 'libro.output.background',
        defaults: { dark: '#292A2D', light: '#fff' },
        description: '',
      },
      {
        id: 'libro.toptoolbar.border.color',
        defaults: {
          dark: Color.rgba(255, 255, 255, 0.1),
          light: Color.rgba(0, 0, 0, 0.1),
        },
        description: '',
      },
      {
        id: 'libro.toptoolbar.icon.color',
        defaults: { dark: '#BFBFBF', light: '#7B7B7B' },
        description: '',
      },
      {
        id: 'libro.toptoolbar.disabled.icon.color',
        defaults: {
          dark: Color.rgba(255, 255, 255, 0.3),
          light: Color.rgba(0, 0, 0, 0.25),
        },
        description: '',
      },
      {
        id: 'libro.toptoolbar.text.color',
        defaults: { dark: '#f5f5f5', light: '#000000' },
        description: '',
      },
      {
        id: 'libro.bottom.btn.background.color',
        defaults: {
          dark: Color.rgba(255, 255, 255, 0.04),
          light: Color.rgba(255, 255, 255, 1),
        },
        description: '',
      },
      {
        id: 'libro.bottom.btn.border.color',
        defaults: { dark: '#505559', light: Color.rgba(0, 10, 26, 0.16) },
        description: '',
      },
      {
        id: 'libro.bottom.btn.icon.color',
        defaults: { dark: '#505559', light: Color.rgba(82, 89, 100, 0.85) },
        description: '',
      },
      {
        id: 'libro.bottom.btn.text.color',
        defaults: { dark: '#E3E4E6', light: Color.rgba(0, 10, 26, 0.68) },
        description: '',
      },
      {
        id: 'libro.default.btn.background.color',
        defaults: { dark: Color.rgba(255, 255, 255, 0.1), light: '#FFFFFF' },
        description: '',
      },
      {
        id: 'libro.default.btn.text.color',
        defaults: { dark: '#E3E4E6', light: Color.rgba(0, 10, 26, 0.68) },
        description: '',
      },
      {
        id: 'libro.primary.btn.background.color',
        defaults: { dark: '#2A97FD', light: '#1890FF' },
        description: '',
      },
      {
        id: 'libro.default.btn.border.color',
        defaults: { dark: '#BDC0C4', light: '#D6D8DA' },
        description: '',
      },
      {
        id: 'libro.toolbar.menu.label.color',
        defaults: { dark: '#BDC0C4', light: Color.rgba(0, 0, 0, 0.65) },
        description: '',
      },
      {
        id: 'libro.toolbar.menu.disabled.label.color',
        defaults: { dark: '#878c93', light: Color.rgba(0, 0, 0, 0.25) },
        description: '',
      },
      {
        id: 'libro.toolbar.menu.keybind.color',
        defaults: { dark: '#878c93', light: Color.rgba(0, 0, 0, 0.45) },
        description: '',
      },
      {
        id: 'libro.sidetoolbar.icon.color',
        defaults: { dark: '#BFBFBF', light: '#6982A9' },
        description: '',
      },
      {
        id: 'libro.sidetoolbar.border.color',
        defaults: {
          dark: Color.rgba(255, 255, 255, 0.08),
          light: Color.rgba(0, 0, 0, 0.1),
        },
        description: '',
      },
      {
        id: 'libro.close.color',
        defaults: {
          dark: Color.rgba(255, 255, 255, 0.45),
          light: Color.rgba(0, 0, 0, 0.45),
        },
        description: '',
      },
      {
        id: 'libro.modal.title.color',
        defaults: { dark: '#EDEEEF', light: Color.rgba(0, 0, 0, 0.85) },
        description: '',
      },
      {
        id: 'libro.modal.content.color',
        defaults: { dark: '#e3e4e6', light: '#000a1a' },
        description: '',
      },
      {
        id: 'libro.btn.primary.background.color',
        defaults: { dark: '#2A97FD', light: '#1890FF' },
        description: '',
      },
      {
        id: 'libro.execution.count.color',
        defaults: { dark: '#8694A9', light: '#6A83AA' },
        description: '',
      },
      {
        id: 'libro.tip.font.color',
        defaults: { dark: '#D6D8DA', light: Color.rgba(0, 0, 0, 0.5) },
        description: '',
      },
      {
        id: 'libro.execution.tip.success.color',
        defaults: { dark: '#48A918', light: '#0DC54E' },
        description: '',
      },
      {
        id: 'libro.link.color',
        defaults: { dark: '#177DDC', light: '#1890FF' },
        description: '',
      },
      {
        id: 'libro.error.color',
        defaults: { dark: '#cf4c52', light: '#ed1345' },
        description: '',
      },
      {
        id: 'libro.cell.border.color',
        defaults: { dark: '#3b3c42', light: '#D6DEE6' },
        description: '',
      },
      {
        id: 'libro.cell.active.border.color',
        defaults: { dark: '#378edf', light: '#3490ed' },
        description: '',
      },
      {
        id: 'libro.cell.active.border.shadow.color',
        defaults: {
          dark: Color.rgba(73, 162, 250, 0.25),
          light: Color.rgba(53, 146, 238, 0.25),
        },
        description: '',
      },
      {
        id: 'libro.cell.header.content',
        defaults: { dark: '#E3E4E6', light: '#545B66' },
        description: '',
      },
      {
        id: 'libro.cell.header.title',
        defaults: { dark: '#d6d8da', light: '#000a1a' },
        description: '',
      },
      {
        id: 'libro.code.border.color',
        defaults: { dark: '#353638', light: '#DCE4EC' },
        description: '',
      },
      {
        id: 'libro.input.border.color',
        defaults: { dark: '#505559', light: Color.rgba(0, 0, 0, 0.15) },
        description: '',
      },
      {
        id: 'libro.input.background.color',
        defaults: { dark: Color.rgba(255, 255, 255, 0.04), light: '#FFFFFF' },
        description: '',
      },
      {
        id: 'libro.input.group.btn.background.color',
        defaults: { dark: Color.rgba(0, 0, 0, 0.02), light: Color.rgba(0, 0, 0, 0.02) },
        description: '',
      },
      {
        id: 'libro.table.innner.border.color',
        defaults: { dark: '#1affffff', light: '#E5EBF1' },
        description: '',
      },
      {
        id: 'libro.table.bottom.border.color',
        defaults: { dark: '#424242', light: '#E2E7EC' },
        description: '',
      },
      {
        id: 'libro.editor.keyword.color',
        defaults: { dark: '#109b67', light: '#098658' },
        description: '',
      },
      {
        id: 'libro.editor.number.color',
        defaults: { dark: '#109b67', light: '#098658' },
        description: '',
      },
      {
        id: 'libro.editor.variable.2.color',
        defaults: { dark: '#5da4ea', light: '#2060A0' },
        description: '',
      },
      {
        id: 'libro.editor.punctuation.color',
        defaults: { dark: '#5da4ea', light: '#2060A0' },
        description: '',
      },
      {
        id: 'libro.editor.property.color',
        defaults: { dark: '#5da4ea', light: '#2060A0' },
        description: '',
      },
      {
        id: 'libro.editor.operator.color',
        defaults: { dark: 'e12ee1', light: '#C700C7' },
        description: '',
      },
      {
        id: 'libro.editor.meta.color',
        defaults: { dark: '#e12ee1', light: '#C700C7' },
        description: '',
      },
      {
        id: 'libro.editor.builtin.color',
        defaults: { dark: '#109b67', light: '#098658' },
        description: '',
      },
      {
        id: 'libro.editor.variable.color',
        defaults: { dark: '#e3e4e6', light: '#212121' },
        description: '',
      },
      {
        id: 'libro.editor.def.color',
        defaults: { dark: '#187dff', light: '#003cff' },
        description: '',
      },
      {
        id: 'libro.editor.comment.color',
        defaults: { dark: '#618961', light: '#406040' },
        description: '',
      },
      {
        id: 'libro.editor.string.color',
        defaults: { dark: '#ff5b48', light: '#c03030' },
        description: '',
      },
      {
        id: 'libro.editor.activeline.color',
        defaults: {
          dark: Color.rgba(229, 232, 240, 0.1),
          light: Color.rgba(229, 232, 240, 0.5),
        },
        description: '',
      },
      {
        id: 'libro.editor.selectionMatch.color',
        defaults: { dark: '#99ff7780', light: '#DDE6FF' },
        description: '',
      },
      {
        id: 'libro.editor.selection.color',
        defaults: { dark: '#B4CEFF', light: '#B4CEFF' },
        description: '',
      },
      {
        id: 'libro.editor.gutter.number.color',
        defaults: { dark: '#a8aebf', light: '#A4AECB' },
        description: '',
      },
      {
        id: 'libro.editor.line.color',
        defaults: { dark: '#565C6D', light: '#A4AECB' },
        description: '',
      },
      {
        id: 'libro.editor.cursor.color',
        defaults: { dark: '#ffffff', light: '#000000' },
        description: '',
      },
      {
        id: 'libro.editor.indent.marker.bg.color',
        defaults: { dark: '#42444d', light: '#d6dbeb' },
        description: '',
      },
      {
        id: 'libro.editor.indent.marker.active.bg.color',
        defaults: { dark: '#788491', light: '#9f9f9f' },
        description: '',
      },
    );
  }
}
