import type { INotebookContent } from '@difizen/libro-common';
import { Syringe } from '@difizen/libro-common/app';

export const ContentContribution = Syringe.defineToken('ContentContribution');
export interface ContentContribution {
  canHandle: (options: Record<string, any>, model: any) => number;
  loadContent: (options: Record<string, any>, model: any) => Promise<INotebookContent>;
}

export const ContentSaveContribution = Syringe.defineToken('ContentSaveContribution');
export interface ContentSaveContribution {
  canHandle: (options: Record<string, any>, model: any) => number;
  saveContent: (options: Record<string, any>, model: any) => Promise<void>;
}
