import type { RefObject } from 'react';
import { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react';

export function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;

  return ref;
}

export const useUnmount = (fn: () => void) => {
  const fnRef = useLatest(fn);

  useEffect(
    () => () => {
      fnRef.current();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
};

export const useMount = (fn: () => void) => {
  useEffect(() => {
    fn?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

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
    if (typeof ref !== 'object') {
      return;
    }
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

export function useSizeCallback(
  fn: (size: Size) => void,
  ref: React.ForwardedRef<HTMLDivElement>,
): void {
  const callback = useLatest((size: Size) => {
    fn(size);
  });
  useLayoutEffect(() => {
    if (typeof ref !== 'object') {
      return;
    }
    const el = ref?.current;
    if (!el || !fn) {
      return;
    }
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        callback.current({
          width: entry.target.clientWidth,
          height: entry.target.clientHeight,
        });
      });
    });

    resizeObserver.observe(el as HTMLElement);
    return () => {
      resizeObserver.disconnect();
    };
  }, [callback, ref, fn]);
}
