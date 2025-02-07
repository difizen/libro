import { ObservableContext } from '@difizen/mana-observable';
import type { Syringe } from '@difizen/mana-syringe';
import { GlobalContainer } from '@difizen/mana-syringe';
import * as React from 'react';

import { ManaContext } from '../module/mana-module-context';

export const useCreateManaContext = (
  context: Syringe.Context | undefined,
  asChild: boolean,
) => {
  const observableContext = React.useContext(ObservableContext);
  const container =
    context?.container ||
    (observableContext.getContainer() as Syringe.Container) ||
    GlobalContainer;
  return React.useMemo(() => {
    if (asChild) {
      return new ManaContext(container.createChild());
    }
    return new ManaContext(container);
  }, [asChild, container]);
};
