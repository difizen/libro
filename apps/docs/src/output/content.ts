import type { INotebookContent } from '@difizen/libro-jupyter';
import { ContentContribution } from '@difizen/libro-jupyter';
import { singleton } from '@difizen/mana-app';

import content from './OutputExamples.ipynb.json';

@singleton({ contrib: ContentContribution })
export class ExampleContentContribution implements ContentContribution {
  canHandle = () => {
    return 10;
  };
  async loadContent() {
    return content as INotebookContent;
  }
}
