import { ObservableContext } from '@difizen/mana-observable';
import type { Syringe } from '@difizen/mana-syringe';
import * as React from 'react';

import type { ManaContext } from '../module/mana-module-context';
import { useMount } from '../utils/hooks';

import { useCreateManaContext } from './hooks';

export interface ContextProps {
  /**
   * 指定容器上下文
   */
  context?: Syringe.Context;
  /**
   * 是否作为子容器
   */
  asChild?: boolean;
  children?: React.ReactNode | React.ReactNode[];
  modules?: Syringe.Module[];
  onReady?: (context: ManaContext, ...args: any) => void;
  loading?: JSX.Element | null;
}

export const ContextComponent = (props: ContextProps) => {
  const { modules, asChild, onReady, loading, context } = props;
  const [ready, setReady] = React.useState(false);

  const manaContext = useCreateManaContext(context, !!asChild);

  const contextValue = React.useMemo(() => {
    return { getContainer: () => manaContext.container };
  }, [manaContext.container]);

  useMount(() => {
    const loadModules = async () => {
      if (modules) {
        for (const moduleOption of modules) {
          await manaContext.load(moduleOption);
        }
      }
    };
    loadModules()
      .then(() => {
        if (onReady) {
          onReady(manaContext);
        }
        setReady(true);
        return;
      })
      .catch((_e) => {
        //
      });
  });

  if (ready) {
    return (
      <ObservableContext.Provider value={contextValue}>
        {props.children}
      </ObservableContext.Provider>
    );
  }
  if (loading) {
    return loading;
  }
  return null;
};
