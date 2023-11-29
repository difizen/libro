export const LibroLabLayoutSlots = {
  header: 'libro-lab-header',
  container: 'libro-lab-container',
  main: 'libro-lab-main',
  footer: 'libro-lab-footer',
  navigator: 'libro-lab-navigator',
  content: 'libro-lab-content',
  contentBottom: 'libro-lab-content-bottom',
};

export type LibroLabLayoutSlotsType =
  (typeof LibroLabLayoutSlots)[keyof typeof LibroLabLayoutSlots];
