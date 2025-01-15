/* eslint-disable @typescript-eslint/no-use-before-define */
import { singleton } from '@difizen/mana-app';
import {
  Slot,
  DefaultSlotView,
  view,
  ManaModule,
  createSlotPreference,
  RootSlotId,
} from '@difizen/mana-app';
import { HeaderView } from '@difizen/mana-app';
import { BoxPanel } from '@difizen/mana-react';
import React, { forwardRef } from 'react';

export enum AppLayoutArea {
  header = 'header',
  content = 'content',
}

const BaseLayout: React.ForwardRefExoticComponent<any> = forwardRef(function BaseLayout(
  props,
  ref: React.ForwardedRef<any>,
) {
  return (
    <BoxPanel direction="top-to-bottom" ref={ref}>
      <BoxPanel.Pane defaultSize={48}>
        <Slot name={AppLayoutArea.header} />
      </BoxPanel.Pane>
      <BoxPanel.Pane flex={1}>
        <Slot name={AppLayoutArea.content} />
      </BoxPanel.Pane>
    </BoxPanel>
  );
});

@singleton()
@view('app-layout')
export class AppLayoutView extends DefaultSlotView {
  override view = BaseLayout;
}

export const LayoutModule = ManaModule.create().register(
  AppLayoutView,
  createSlotPreference({
    slot: RootSlotId,
    view: AppLayoutView,
  }),
  createSlotPreference({
    slot: AppLayoutArea.header,
    view: HeaderView,
  }),
);
