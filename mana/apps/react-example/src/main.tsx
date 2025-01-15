import { ManaAppPreset, ManaComponents } from '@difizen/mana-app';
import React from 'react';
import { createRoot } from 'react-dom/client';

import Application from './components/Application';
import { BaseModule } from './module';

// Say something
console.warn('[ERWT] : Renderer execution started');

// Application to Render
const app = (
  <ManaComponents.Application
    asChild={true}
    modules={[ManaAppPreset, BaseModule]}
    renderChildren
  >
    <Application />
  </ManaComponents.Application>
);

// Render application in DOM
createRoot(document.getElementById('app')).render(app);
