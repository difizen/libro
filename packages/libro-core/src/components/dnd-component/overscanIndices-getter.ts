export type OverscanIndicesGetterParams = {
  // One of SCROLL_DIRECTION_HORIZONTAL or SCROLL_DIRECTION_VERTICAL
  direction: 'horizontal' | 'vertical';

  // One of SCROLL_DIRECTION_BACKWARD or SCROLL_DIRECTION_FORWARD
  scrollDirection: -1 | 1;

  // Number of rows or columns in the current axis
  cellCount: number;

  // Maximum number of cells to over-render in either direction
  overscanCellsCount: number;

  // Begin of range of visible cells
  startIndex: number;

  // End of range of visible cells
  stopIndex: number;
};

export type OverscanIndices = {
  overscanStartIndex: number;
  overscanStopIndex: number;
};

export const SCROLL_DIRECTION_BACKWARD = -1;
export const SCROLL_DIRECTION_FORWARD = 1;

export const SCROLL_DIRECTION_HORIZONTAL = 'horizontal';
export const SCROLL_DIRECTION_VERTICAL = 'vertical';

let overscanIndicesCache: { value: any; timestamp: number } | null = null;

/**
 * Calculates the number of cells to overscan before and after a specified range.
 * This function ensures that overscanning doesn't exceed the available cells.
 */
export default function libroOverscanIndicesGetter({
  cellCount,
  overscanCellsCount,
  scrollDirection,
  startIndex,
  stopIndex,
}: OverscanIndicesGetterParams): OverscanIndices {
  // Make sure we render at least 1 cell extra before and after (except near boundaries)
  // This is necessary in order to support keyboard navigation (TAB/SHIFT+TAB) in some cases
  // For more info see issues #625

  // 计算 overscanIndices 的函数
  const calculateOverscanIndices = () => {
    const _overscanCellsCount = Math.max(1, overscanCellsCount);

    let overscanIndices = null;

    if (scrollDirection === SCROLL_DIRECTION_FORWARD) {
      overscanIndices = {
        overscanStartIndex: Math.max(0, startIndex - 1),
        overscanStopIndex: Math.min(cellCount - 1, stopIndex + _overscanCellsCount),
      };
    } else {
      overscanIndices = {
        overscanStartIndex: Math.max(0, startIndex - _overscanCellsCount),
        overscanStopIndex: Math.min(cellCount - 1, stopIndex + 1),
      };
    }

    return overscanIndices;
  };

  // 检查缓存和时间戳函数
  const checkCacheAndTimestamp = () => {
    if (cellCount === 1) {
      // 'horizontal' 方向 不用缓存
      const overscanIndices = calculateOverscanIndices();
      return overscanIndices;
    }

    if (overscanIndicesCache && Date.now() - overscanIndicesCache.timestamp < 500) {
      return overscanIndicesCache.value;
    } else {
      const overscanIndices = calculateOverscanIndices();
      overscanIndicesCache = {
        value: overscanIndices,
        timestamp: Date.now(),
      };

      return overscanIndices;
    }
  };

  return checkCacheAndTimestamp();
}
