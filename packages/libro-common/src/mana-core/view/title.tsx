import { prop } from '@difizen/mana-observable';
import { transient } from '@difizen/mana-syringe';
import type * as React from 'react';

import type { View } from './view-protocol';
import type { Title } from './view-protocol';

@transient()
export class ViewTitle implements Title<View> {
  owner: View;
  @prop()
  label?: React.ReactNode | React.FC;
  @prop()
  icon?: React.ReactNode | React.FC;
  @prop()
  caption?: string;
  @prop()
  className?: string;
  @prop()
  closable?: boolean = true;
  constructor(owner: View) {
    this.owner = owner;
  }
}
