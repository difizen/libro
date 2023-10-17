import { useEffect, useRef, useState } from 'react';

import useScroll from './useScroll';
import { useWindowSize } from './useWindowSize';

interface AnimateOption {
  /** 滚动的断点，一到了该断点开启动画 */
  scrollHeight: number;
  beforeEffect: Record<string, any>;
  afterEffect: Record<string, any>;
}

function useAnimate(props: AnimateOption) {
  const animateOptionRef = useRef(props);

  const scroll = useScroll();
  const { height } = useWindowSize();
  const [animate, setAnimate] = useState(animateOptionRef.current.beforeEffect);

  useEffect(() => {
    if (scroll + height > animateOptionRef.current.scrollHeight) {
      setAnimate(animateOptionRef.current.afterEffect);
    } else {
      setAnimate(animateOptionRef.current.beforeEffect);
    }
  }, [scroll, height]);

  return animate;
}

export default useAnimate;
