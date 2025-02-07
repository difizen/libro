import 'react';
import assert from 'assert';

import { Container } from '../../mana-syringe/index.js';

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
