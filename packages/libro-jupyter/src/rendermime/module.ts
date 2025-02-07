import { ManaModule } from '@difizen/libro-common/app';

import { LibroPlotlyMimeTypeContribution } from './plotly-rendermime-contribution.js';

export const PlotlyModule = ManaModule.create().register(
  LibroPlotlyMimeTypeContribution,
);
