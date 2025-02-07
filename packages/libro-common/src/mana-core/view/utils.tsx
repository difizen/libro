import { getOrigin } from '@difizen/mana-observable';
import React from 'react';
/**
 * hack
 * @param component react component
 * @returns
 */
export const isForwardRefComponent = (
  component: any,
): component is React.ForwardRefExoticComponent<any> => {
  return !!(
    component &&
    component.$$typeof !== undefined &&
    component.render !== undefined
  );
};
/**
 * hack
 * @param component react component
 * @returns
 */
export const isMemoComponent = (
  component: any,
): component is React.ForwardRefExoticComponent<any> => {
  return !!(
    component &&
    component.$$typeof !== undefined &&
    component.type !== undefined
  );
};

export function renderNode(nodeOrFC: React.ReactNode | React.FC) {
  if (typeof nodeOrFC === 'string') {
    return <span>{nodeOrFC}</span>;
  }
  if (React.isValidElement(nodeOrFC)) {
    return getOrigin(nodeOrFC);
  }
  if (
    typeof nodeOrFC === 'function' ||
    isForwardRefComponent(nodeOrFC) ||
    isMemoComponent(nodeOrFC)
  ) {
    const FC = nodeOrFC;
    return <FC />;
  }
  return <></>;
}
