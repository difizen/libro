import 'react';
import assert from 'assert';

import { Container } from '@difizen/mana-syringe';

import { ApplicationModule } from '../index';

import { ThemeModule, ThemeService } from './index';

describe('theme', () => {
  it('#theme module load', () => {
    const container = new Container();
    container.load(ApplicationModule);
    container.load(ThemeModule);
    assert(container.get(ThemeService));
  });
});
