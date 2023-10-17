import { RenderMimeContribution } from '@difizen/libro-rendermime';
import { singleton } from '@difizen/mana-app';

import { PlotlyRender } from './plotly-render.js';

@singleton({ contrib: RenderMimeContribution })
export class LibroPlotlyMimeTypeContribution implements RenderMimeContribution {
  canHandle = () => {
    return 100;
  };
  renderType = 'plotlyRender';
  safe = true;
  mimeTypes = ['application/vnd.plotly.v1+json'];
  render = PlotlyRender;
}
