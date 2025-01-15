import type { Newable } from '@difizen/mana-common';
import type { Syringe } from '@difizen/mana-syringe';
import { registerSideOption } from '@difizen/mana-syringe';

import type { ManaModule } from '../module';
import { ManaContext } from '../module';

import { isWrapperViewComponent, ViewWrapper } from './view-container';
import { ViewManager } from './view-manager';
import type { SlotPreference, ViewPreference } from './view-protocol';
import type { View } from './view-protocol';
import { OriginViewComponent, ViewComponent } from './view-protocol';
import { SlotPreferenceContribution } from './view-protocol';
import {
  ViewDefineToken,
  ViewInstance,
  ViewOption,
  ViewFactory,
  ViewPreferenceContribution,
} from './view-protocol';

export const createViewPreference = (...preferences: ViewPreference[]) => {
  return { token: ViewPreferenceContribution, useValue: preferences };
};

export const createSlotPreference = (...preferences: SlotPreference[]) => {
  return { token: SlotPreferenceContribution, useValue: preferences };
};

export interface ViewDecoratorOption {
  asChild?: boolean;
  registry?: Syringe.Registry;
}

export function view<T extends View>(factoryId: string, viewModule?: ManaModule) {
  return (target: Newable<T>): void => {
    Reflect.defineMetadata(ViewDefineToken, factoryId, target);
    registerSideOption(
      {
        token: ViewFactory,
        useDynamic: (ctx: Syringe.Context) => ({
          id: factoryId,
          createView: async (viewOption: any, specModule?: ManaModule) => {
            const module = specModule || viewModule;
            let { container } = ctx;
            container = ctx.container.createChild();
            const context = new ManaContext(container);
            if (module) {
              await context.load(module);
            }
            container.register({ token: ViewOption, useValue: viewOption });
            const current = container.get<View>(target);
            container.register({ token: ViewInstance, useValue: current });
            container.register({
              token: OriginViewComponent,
              useDynamic: () => {
                const component = current.view as any;
                if (isWrapperViewComponent(component)) {
                  return component[OriginViewComponent];
                } else {
                  return component;
                }
              },
            });
            const viewComponent = ViewWrapper(current.view, container);
            container.register({
              token: ViewComponent,
              useDynamic: () => {
                const component = current.view as any;
                if (isWrapperViewComponent(component)) {
                  return component;
                } else {
                  return ViewWrapper(current.view, container);
                }
              },
            });
            current.view = viewComponent;
            const manager = container.get(ViewManager);
            manager.setViewContext(current, context);
            return current;
          },
        }),
      },
      target,
    );
  };
}
