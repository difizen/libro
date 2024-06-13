import type { ColorRegistry } from '@difizen/mana-app';
import { Color, ColorContribution } from '@difizen/mana-app';
import { singleton } from '@difizen/mana-app';

@singleton({ contrib: ColorContribution })
export class LibroJupyterColorContribution implements ColorContribution {
  registerColors(colors: ColorRegistry): void {
    // common
    colors.register(
      // #region antd variable
      {
        id: 'libro.add.between.divider.color',
        defaults: { dark: '#467DB0', light: '#BFE0FF' },
        description: '',
      },
      {
        id: 'libro.add.between.icon.color',
        defaults: { dark: '#467DB0', light: '#6982A9' },
        description: '',
      },
      {
        id: 'libro.add.between.icon.hover.color',
        defaults: { dark: '#588DBE', light: '#1890ff' },
        description: '',
      },
      {
        id: 'libro.add.between.popover.background.color',
        defaults: { dark: '#2f3032', light: '#ffffff' },
        description: '',
      },
      {
        id: 'libro.add.between.menu.label.color',
        defaults: { dark: '#BDC0C4', light: Color.rgba(0, 0, 0, 0.65) },
        description: '',
      },
      {
        id: 'libro.add.between.hover.color',
        defaults: { dark: '#515359', light: '#EBF6FF' },
        description: '',
      },
      {
        id: 'libro.drawer.close.color',
        defaults: {
          dark: Color.rgba(255, 255, 255, 0.45),
          light: Color.rgba(0, 0, 0, 0.45),
        },
        description: '',
      },
      {
        id: 'libro.drawer.title.color',
        defaults: { dark: '#EDEEEF', light: Color.rgba(0, 0, 0, 0.85) },
        description: '',
      },
      {
        id: 'libro.drawer.segmented.select.color',
        defaults: { dark: '#edeeef', light: '#000a1a' },
        description: '',
      },
      {
        id: 'libro.drawer.segmented.select.background.color',
        defaults: { dark: '#ffffff14', light: '#ffffff' },
        description: '',
      },
      {
        id: 'libro.drawer.segmented.color',
        defaults: { dark: '#bdc0c4', light: '#000a1a78' },
        description: '',
      },
      {
        id: 'libro.drawer.segmented.background.color',
        defaults: { dark: '#ffffff0f', light: '#151b210f' },
        description: '',
      },
      {
        id: 'libro.table.title.color',
        defaults: { dark: '#E3E4E6', light: Color.rgba(0, 10, 26, 0.89) },
        description: '',
      },
      {
        id: 'libro.filtered.background.color',
        defaults: {
          dark: Color.rgba(255, 255, 255, 0.1),
          light: Color.rgba(0, 10, 26, 0.04),
        },
        description: '',
      },
      {
        id: 'libro.filtered.text.color',
        defaults: { dark: '#878C93', light: Color.rgba(0, 10, 26, 0.26) },
        description: '',
      },
      {
        id: 'libro.filtered.border.color',
        defaults: { dark: '#2F3032', light: '#f0f0f0' },
        description: '',
      },
      {
        id: 'libro.table.border.color',
        defaults: { dark: Color.rgba(255, 255, 255, 0.04), light: '#f0f0f0' },
        description: '',
      },
      {
        id: 'libro.btn.hover.color',
        defaults: { dark: '#515359', light: '#fff' },
        description: '',
      },
      {
        id: 'libro.keybind.tag.background.color',
        defaults: { dark: Color.rgba(245, 245, 245, 0.2), light: '#f5f5f5' },
        description: '',
      },
      {
        id: 'libro.keybind.tag.text.color',
        defaults: { dark: '#BDC0C4', light: Color.rgba(0, 0, 0, 0.65) },
        description: '',
      },
      {
        id: 'libro.search.match.background.color',
        defaults: { dark: '#BCCEFF', light: '#B9D1FF' },
        description: '',
      },
      {
        id: 'libro.vis.button.border',
        defaults: { dark: '#505559', light: Color.rgba(0, 10, 26, 0.1) },
        description: '',
      },
      {
        id: 'libro.vis.button.background',
        defaults: { dark: '#2F3032', light: '#FFFFFF' },
        description: '',
      },
      {
        id: 'libro.vis.button.text.color',
        defaults: { dark: '#BDC0C4', light: Color.rgba(0, 10, 26, 0.68) },
        description: '',
      },
      {
        id: 'libro.llm.response.output.text.color',
        defaults: { dark: '#878C93', light: Color.rgba(0, 10, 26, 0.68) },
        description: '',
      },
    );

    //
    colors.register(
      {
        id: 'libro.kernel.text',
        defaults: { dark: '#BDC0C4', light: Color.rgba(0, 10, 26, 0.89) },
        description: '',
      },
      {
        id: 'libro.kernel.select.text',
        defaults: { dark: '#E3E4E6', light: Color.rgba(0, 10, 26, 0.68) },
        description: '',
      },
      {
        id: 'libro.kernel.status.text',
        defaults: { dark: '#BDC0C4', light: Color.rgba(0, 10, 26, 0.47) },
        description: '',
      },
      {
        id: 'libro.kernel.badge.border.color',
        defaults: { dark: '#E3E4E6', light: '#ffffff' },
        description: '',
      },
      {
        id: 'libro.jupyter.kernel.status.background.color',
        defaults: { dark: '#2F3032', light: '#ffffff' },
        description: '',
      },
      {
        id: 'libro.jupyter.kernel.status.active.step.title.color',
        defaults: { dark: '#E3E4E6', light: Color.rgba(0, 0, 0, 0.85) },
        description: '',
      },
      {
        id: 'libro.jupyter.kernel.status.title.color',
        defaults: { dark: '#878C93', light: Color.rgba(0, 0, 0, 0.45) },
        description: '',
      },
      {
        id: 'libro.jupyter.kernel.status.menu.color',
        defaults: { dark: '#e3e4e6', light: Color.rgba(0, 0, 0, 0.65) },
        description: '',
      },
      {
        id: 'libro.jupyter.kernel.status.step.description.color',
        defaults: { dark: '#D6D8DA', light: Color.rgba(0, 10, 26, 0.68) },
        description: '',
      },
      {
        id: 'libro.jupyter.kernel.status.step.active.background.color',
        defaults: { dark: '#2A97FD', light: '#1890FF' },
        description: '',
      },
      {
        id: 'libro.jupyter.kernel.status.step.active.secondary.color',
        defaults: { dark: '#FFFFFF', light: '#ffffff' },
        description: '',
      },
      {
        id: 'libro.diff.cell.header.execution.color',
        defaults: { dark: '#6A83AA', light: '#6A83AA' },
        description: '',
      },
      {
        id: 'libro.diff.unchanged.cell.header.color',
        defaults: { dark: Color.rgba(255, 255, 255, 0.06), light: '#EAECF2' },
        description: '',
      },
      {
        id: 'libro.diff.container.color',
        defaults: { dark: '#1f2022', light: '#ffffff' },
        description: '',
      },
      {
        id: 'libro.diff.input.background.color',
        defaults: { dark: '#19191B', light: '#F4F6FB' },
        description: '',
      },
      {
        id: 'libro.diff.editor.background.color',
        defaults: { dark: '#1F2022', light: '#ffffff' },
        description: '',
      },
      {
        id: 'libro.diff.cell.border.color',
        defaults: { dark: '#3B3C42', light: '#D7DBE7' },
        description: '',
      },
      {
        id: 'libro.diff.editor.removed.color',
        defaults: { dark: '#4F2726', light: '#FAF0F0' },
        description: '',
      },
      {
        id: 'libro.diff.editor.added.color',
        defaults: { dark: '#334126', light: '#ECF4E3' },
        description: '',
      },
      {
        id: 'libro.diff.editor.line.insert.color',
        defaults: {
          dark: Color.rgba(83, 104, 48, 0.45),
          light: Color.rgba(189, 214, 151, 0.25),
        },
        description: '',
      },
      {
        id: 'libro.diff.editor.line.delete.color',
        defaults: {
          dark: Color.rgba(126, 50, 45, 0.45),
          light: Color.rgba(241, 212, 216, 0.35),
        },
        description: '',
      },
      {
        id: 'libro.diff.editor.char.insert.color',
        defaults: {
          dark: Color.rgba(16, 22, 3, 0.7),
          light: Color.rgba(67, 151, 36, 0.25),
        },
        description: '',
      },
      {
        id: 'libro.diff.editor.char.delete.color',
        defaults: {
          dark: Color.rgba(53, 15, 14, 0.7),
          light: Color.rgba(255, 0, 0, 0.2),
        },
        description: '',
      },
      {
        id: 'libro.diff.fold.background.color',
        defaults: {
          dark: Color.rgba(255, 255, 255, 0.08),
          light: Color.rgba(0, 10, 26, 0.02),
        },
        description: '',
      },
      {
        id: 'libro.diff.fold.hover.background.color',
        defaults: {
          dark: Color.rgba(255, 255, 255, 0.1),
          light: Color.rgba(0, 10, 26, 0.04),
        },
        description: '',
      },
      {
        id: 'libro.diff.fold.text.color',
        defaults: { dark: '#BDC0C4', light: Color.rgba(0, 10, 26, 0.47) },
        description: '',
      },
      {
        id: 'libro.diff.content.same.text.color',
        defaults: { dark: '#E3E4E6', light: Color.rgba(0, 10, 26, 0.68) },
        description: '',
      },
      {
        id: 'libro.diff.select.background.color',
        defaults: { dark: '#BCCEFF', light: '#e5ebf1' },
        description: '',
      },
      {
        id: 'libro.diff.select.highlight.background.color',
        defaults: { dark: '#C8D1E7', light: '#DDE6FF' },
        description: '',
      },
      {
        id: 'libro.diff.editor.gutter.number.color',
        defaults: { dark: '#a8aebf', light: '#A4AECB' },
        description: '',
      },
      {
        id: 'libro.copilot.editor.placeholder.color',
        defaults: { dark: '#878C93', light: Color.rgba(0, 10, 26, 0.26) },
        description: '',
      },
    );
  }
}
