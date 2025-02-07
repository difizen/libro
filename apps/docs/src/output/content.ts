import type { INotebookContent } from '@difizen/libro';
import { ContentContribution } from '@difizen/libro';
import { singleton } from '@difizen/libro-common/mana-app';

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
