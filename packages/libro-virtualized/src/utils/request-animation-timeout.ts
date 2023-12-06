import { caf, raf } from './animation-frame.js';

export type AnimationTimeoutId = {
  id: number;
};

export const cancelAnimationTimeout = (frame: AnimationTimeoutId) => caf(frame.id);

/**
 * Recursively calls requestAnimationFrame until a specified delay has been met or exceeded.
 * When the delay time has been reached the function you're timing out will be called.
 *
 * Credit: Joe Lambert (https://gist.github.com/joelambert/1002116#file-requesttimeout-js)
 */
export const requestAnimationTimeout = (
  callback: () => any,
  delay: number,
): AnimationTimeoutId => {
  let start: number;
  // wait for end of processing current event handler, because event handler may be long
  Promise.resolve()
    .then(() => {
      start = Date.now();
      return;
    })
    .catch((e) => {
      //
    });

  const timeout = () => {
    if (Date.now() - start >= delay) {
      callback();
    } else {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      frame.id = raf(timeout);
    }
  };

  const frame: AnimationTimeoutId = {
    id: raf(timeout),
  };

  return frame;
};
