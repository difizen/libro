declare module '*.less';

declare module 'plotly.js' {
  export type Frame = Record<string, any>;
  export function addFrames(root: Plotly.Root, frames: Frame[]): Promise<void>;
  export function animate(root: Plotly.Root): void;
  export type Data = any;
  export type Layout = any;

  type PlotlyEvent =
    | 'plotly_webglcontextlost'
    | 'plotly_restyle'
    | 'plotly_relayout'
    | 'plotly_update'
    | 'plotly_click'
    | 'plotly_hover'
    | 'plotly_unhover'
    | 'plotly_selected'
    | 'plotly_deselect'
    | 'plotly_doubleclick';

  export interface PlotlyHTMLElement extends HTMLElement {
    _fullData: Data;
    _fullLayout: Layout;
    data: Data;
    layout: Layout;
    on(event: PlotlyEvent, callback: (update: any) => void): void;
  }
  export function react(node: HTMLElement, data: any, layout: any, config: any): void;
  export function toImage(...args: any[]): Promise<string>;
}
