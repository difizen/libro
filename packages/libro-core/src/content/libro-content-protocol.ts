import type { INotebookContent } from '@difizen/libro-common';
import { Syringe } from '@difizen/mana-app';

export const ContentContribution = Syringe.defineToken('ContentContribution');
export interface ContentContribution {
  canHandle: (options: Record<string, any>, model: any) => number;
  loadContent: (options: Record<string, any>, model: any) => Promise<INotebookContent>;
}
