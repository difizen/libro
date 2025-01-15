import { ManaComponents } from '@difizen/mana-app';
import { ManaAppPreset } from '@difizen/mana-app';

import { ContentModule } from './content.js';
import { LayoutModule } from './layout.js';

export default function Basic(): JSX.Element {
  return (
    <ManaComponents.Application
      asChild={true}
      modules={[ManaAppPreset, LayoutModule, ContentModule]}
    />
  );
}
