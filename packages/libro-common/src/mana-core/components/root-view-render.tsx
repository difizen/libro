import { useInject } from '@difizen/mana-observable';

import { ViewManager, ViewRender } from '../view';

export const RootViewRender = (props: { loading: JSX.Element | null }) => {
  const { loading } = props;
  const viewManager = useInject(ViewManager);
  const rootView = viewManager.root;
  if (rootView) {
    return <ViewRender view={rootView} />;
  }
  return loading;
};
