import type { View } from '@difizen/mana-app';
import { Syringe } from '@difizen/mana-app';

import type { LibroView } from '../libro-view.js';

export type LibroExtensionSlotFactory = (view: LibroView) => Promise<View>;

export const LibroExtensionSlotContribution = Syringe.defineToken(
  'LibroExtensionSlotContribution',
);
export interface LibroExtensionSlotContribution {
  factory: LibroExtensionSlotFactory;
  slot: LibroSlot;
  viewOpenOption?: {
    order?: string;
    reveal?: boolean;
  };
}

export type LibroSlot = 'content' | 'container' | 'list' | 'right' | 'containerLog';

export interface DisplayView {
  isDisplay: boolean;
}

export function isDisplayView(object: any): object is DisplayView {
  return 'isDisplay' in object;
}
