import type { ReactElement } from 'react';
import './index.less';

export function Title({
  marginTop,
  marginBottom,
  children,
}: {
  children: ReactElement | string;
  marginTop?: number;
  marginBottom?: number;
}) {
  return (
    <h1 className="difizen-dumi-title" style={{ marginTop, marginBottom }}>
      {children}
    </h1>
  );
}
