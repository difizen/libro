export const LibroLabLayoutSlots = {
  header: 'libro-lab-header',
  container: 'libro-lab-container',
  main: 'libro-lab-main',
  footer: 'libro-lab-footer',
  navigator: 'libro-lab-navigator',
  content: 'libro-lab-content',
  contentBottom: 'libro-lab-content-bottom',
  alert: 'libro-lab-alert',
};

export type StatusType = 'loading' | 'success';

export interface StatusItem {
  label: string;
  icon: JSX.Element;
}

export type LibroLabLayoutSlotsType =
  (typeof LibroLabLayoutSlots)[keyof typeof LibroLabLayoutSlots];
