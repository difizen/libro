import { useUnmount } from '@difizen/mana-app';
import type { RefObject } from 'react';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';

function useRafState<S>(initialState?: S) {
  const ref = useRef(0);
  const [state, setState] = useState<S | undefined>(initialState);

  const setRafState = useCallback((value: S) => {
    cancelAnimationFrame(ref.current);

    ref.current = requestAnimationFrame(() => {
      setState(value);
    });
  }, []);

  useUnmount(() => {
    cancelAnimationFrame(ref.current);
  });

  return [state, setRafState] as const;
}

type Size = { width: number; height: number };
export function useSize(ref: RefObject<HTMLDivElement>): Size | undefined {
  const [size, setSize] = useRafState<Size>();
  useLayoutEffect(() => {
    const el = ref?.current;
    if (!el) {
      return;
    }
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const { clientWidth, clientHeight } = entry.target;
        setSize({
          width: clientWidth,
          height: clientHeight,
        });
      });
    });

    resizeObserver.observe(el);
    return () => {
      resizeObserver.disconnect();
    };
  }, [ref, setSize]);
  return size;
}
