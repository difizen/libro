import React from 'react';

export const DisplayWrapComponent: React.FC<{
  children: any;
  mode: boolean | undefined;
}> = ({ children, mode }) => {
  if (mode) {
    return null;
  }
  return <div>{children}</div>;
};
