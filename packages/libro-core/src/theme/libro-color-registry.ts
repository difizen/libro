import type { ColorRegistry } from '@difizen/mana-app';
import { ColorContribution } from '@difizen/mana-app';
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
        defaults: { dark: '#1F2022', light: '#FFFFFF' },
        description: '',
      },
      {
        id: 'libro.popover.background.color',
        defaults: { dark: '#2F3032', light: '#FFFFFF' },
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
          dark: '#FFFFFF4D',
          light: '#00000033',
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
        defaults: { dark: '#E3E4E6', light: '#000000' },
        description: '',
      },
      {
        id: 'libro.text.tertiary.color',
        defaults: { dark: '#BDC0C4', light: '#B8BABA' },
        description: '',
      },
      {
        id: 'libro.output.background',
        defaults: { dark: '#292A2D', light: '#FFFFFF' },
        description: '',
      },
      {
        id: 'libro.toptoolbar.border.color',
        defaults: {
          dark: '#FFFFFF1A',
          light: '#0000001A',
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
          dark: '#FFFFFF4D',
          light: '#00000040',
        },
        description: '',
      },
      {
        id: 'libro.toptoolbar.text.color',
        defaults: { dark: '#F5F5F5', light: '#000000' },
        description: '',
      },
      {
        id: 'libro.bottom.btn.background.color',
        defaults: {
          dark: '#FFFFFF0A',
          light: '#FFFFFF',
        },
        description: '',
      },
      {
        id: 'libro.bottom.btn.border.color',
        defaults: { dark: '#505559', light: '#000A1A29' },
        description: '',
      },
      {
        id: 'libro.bottom.btn.icon.color',
        defaults: { dark: '#505559', light: '#525964D9' },
        description: '',
      },
      {
        id: 'libro.bottom.btn.text.color',
        defaults: { dark: '#E3E4E6', light: '#000A1AAD' },
        description: '',
      },
      {
        id: 'libro.default.btn.background.color',
        defaults: { dark: '#FFFFFF1A', light: '#FFFFFF' },
        description: '',
      },
      {
        id: 'libro.default.btn.text.color',
        defaults: { dark: '#E3E4E6', light: '#000A1AAD' },
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
        defaults: { dark: '#BDC0C4', light: '#000000A6' },
        description: '',
      },
      {
        id: 'libro.toolbar.menu.disabled.label.color',
        defaults: { dark: '#878C93', light: '#00000040' },
        description: '',
      },
      {
        id: 'libro.toolbar.menu.keybind.color',
        defaults: { dark: '#878C93', light: '#00000073' },
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
          dark: '#FFFFFF14',
          light: '#0000001A',
        },
        description: '',
      },
      {
        id: 'libro.close.color',
        defaults: {
          dark: '#FFFFFF73',
          light: '#00000073',
        },
        description: '',
      },
      {
        id: 'libro.modal.title.color',
        defaults: { dark: '#EDEEEF', light: '#000000D9' },
        description: '',
      },
      {
        id: 'libro.modal.content.color',
        defaults: { dark: '#E3E4E6', light: '#000A1A' },
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
        defaults: { dark: '#D6D8DA', light: '#00000080' },
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
        defaults: { dark: '#CF4C52', light: '#ED1345' },
        description: '',
      },
      {
        id: 'libro.cell.border.color',
        defaults: { dark: '#3B3C42', light: '#D6DEE6' },
        description: '',
      },
      {
        id: 'libro.cell.active.border.color',
        defaults: { dark: '#378EDF', light: '#3490ED' },
        description: '',
      },
      {
        id: 'libro.cell.active.border.shadow.color',
        defaults: {
          dark: '#49A2FA40',
          light: '#3592EE40',
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
        defaults: { dark: '#D6D8DA', light: '#000A1A' },
        description: '',
      },
      {
        id: 'libro.code.border.color',
        defaults: { dark: '#353638', light: '#DCE4EC' },
        description: '',
      },
      {
        id: 'libro.input.border.color',
        defaults: { dark: '#505559', light: '#00000026' },
        description: '',
      },
      {
        id: 'libro.input.background.color',
        defaults: { dark: '#FFFFFF0A', light: '#FFFFFF' },
        description: '',
      },
      {
        id: 'libro.input.group.btn.background.color',
        defaults: { dark: '#00000005', light: '#00000005' },
        description: '',
      },
      {
        id: 'libro.table.innner.border.color',
        defaults: { dark: '#1AFFFF', light: '#E5EBF1' },
        description: '',
      },
      {
        id: 'libro.table.bottom.border.color',
        defaults: { dark: '#424242', light: '#E2E7EC' },
        description: '',
      },
      {
        id: 'libro.editor.keyword.color',
        defaults: { dark: '#109B67', light: '#098658' },
        description: '',
      },
      {
        id: 'libro.editor.number.color',
        defaults: { dark: '#109B67', light: '#098658' },
        description: '',
      },
      {
        id: 'libro.editor.variable.2.color',
        defaults: { dark: '#5DA4EA', light: '#2060A0' },
        description: '',
      },
      {
        id: 'libro.editor.punctuation.color',
        defaults: { dark: '#5DA4EA', light: '#2060A0' },
        description: '',
      },
      {
        id: 'libro.editor.property.color',
        defaults: { dark: '#5DA4EA', light: '#2060A0' },
        description: '',
      },
      {
        id: 'libro.editor.operator.color',
        defaults: { dark: 'E12EE1', light: '#C700C7' },
        description: '',
      },
      {
        id: 'libro.editor.meta.color',
        defaults: { dark: '#E12EE1', light: '#C700C7' },
        description: '',
      },
      {
        id: 'libro.editor.builtin.color',
        defaults: { dark: '#109B67', light: '#098658' },
        description: '',
      },
      {
        id: 'libro.editor.variable.color',
        defaults: { dark: '#E3E4E6', light: '#212121' },
        description: '',
      },
      {
        id: 'libro.editor.class.color',
        defaults: { dark: '#6868f3', light: '#0000ff' },
        description: '',
      },
      {
        id: 'libro.editor.def.color',
        defaults: { dark: '#187DFF', light: '#003CFF' },
        description: '',
      },
      {
        id: 'libro.editor.comment.color',
        defaults: { dark: '#618961', light: '#406040' },
        description: '',
      },
      {
        id: 'libro.editor.string.color',
        defaults: { dark: '#FF5B48', light: '#C03030' },
        description: '',
      },
      {
        id: 'libro.editor.activeline.color',
        defaults: {
          dark: '#E5E8F01A',
          light: '#E5E8F080',
        },
        description: '',
      },
      {
        id: 'libro.editor.selectionMatch.color',
        defaults: { dark: '#99FF7780', light: '#DDE6FF' },
        description: '',
      },
      {
        id: 'libro.editor.selection.color',
        defaults: { dark: '#B4CEFF', light: '#B4CEFF' },
        description: '',
      },
      {
        id: 'libro.editor.gutter.number.color',
        defaults: { dark: '#A8AEBF', light: '#A4AECB' },
        description: '',
      },
      {
        id: 'libro.editor.line.color',
        defaults: { dark: '#565C6D', light: '#A4AECB' },
        description: '',
      },
      {
        id: 'libro.editor.cursor.color',
        defaults: { dark: '#FFFFFF', light: '#000000' },
        description: '',
      },
      {
        id: 'libro.editor.search.match',
        defaults: { dark: '#8c4717', light: '#ffb184' },
        description: '',
      },
      {
        id: 'libro.editor.search.currentmatch',
        defaults: { dark: '#a87713', light: '#fbde28' },
        description: '',
      },
      {
        id: 'libro.editor.indent.marker.bg.color',
        defaults: { dark: '#42444D', light: '#D6DBEB' },
        description: '',
      },
      {
        id: 'libro.editor.indent.marker.active.bg.color',
        defaults: { dark: '#788491', light: '#9f9f9f' },
        description: '',
      },
      {
        id: 'libro.cell.selected.bg.color',
        defaults: { dark: '#353638', light: '#F1FAFF' },
        description: '',
      },
    );
  }
}
