import { Syringe } from '@difizen/mana-syringe';

import type { VariableDefinition } from '../protocol';

import type { Color } from './color';
import type { ColorRegistry } from './color-registry';

export const ColorContribution = Syringe.defineToken('ColorContribution');
export type ColorContribution = {
  registerColors: (colors: ColorRegistry) => void;
};

export type ColorDefinition = VariableDefinition<Color>;
