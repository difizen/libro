import { ManaModule } from '@difizen/mana-app';

import { LibroPlotlyMimeTypeContribution } from './plotly-rendermime-contribution.js';

export const PlotlyModule = ManaModule.create().register(
  LibroPlotlyMimeTypeContribution,
);
