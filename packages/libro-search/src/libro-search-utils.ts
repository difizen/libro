import type { SearchMatch } from '@difizen/libro-code-editor';
import { singleton } from '@difizen/libro-common/app';

/**
 * Search Utils
 */
@singleton()
export class LibroSearchUtils {
  /**
   * 查找当前 position 最靠近的匹配项，适用于文本中查找
   * @param matches 匹配项列表，通常来自一个 cell 或者 output
   * @param position 查找起点，当前位置的文本偏移量
   * @param lower 查找范围下限，值为匹配列表 index
   * @param higher 查找范围上限，值为匹配列表 index
   * @returns 下一个匹配项的 index，如果没有找到则返回 null
   */
  findNext(
    matches: SearchMatch[],
    position: number,
    lower = 0,
    higher = Infinity,
  ): number | undefined {
    let higherBound = Math.min(matches.length - 1, higher);
    let lowerBound = lower;
    while (lowerBound <= higherBound) {
      // 取中间匹配项
      const middle = Math.floor(0.5 * (lowerBound + higherBound));
      // 中间匹配项的文本偏移量
      const currentPosition = matches[middle].position;

      if (currentPosition < position) {
        // 中间值的偏移量小于查找起点
        lowerBound = middle + 1; // 场景1：查找范围下限太小，需要增大，更新中间值
        if (lowerBound < matches.length && matches[lowerBound].position > position) {
          return lowerBound; // 场景2：下限已经是要查找的前一个匹配项了，下个匹配项的偏移量会大于查找起点。
        }
      } else if (currentPosition > position) {
        // 中间值的偏移量大于查找起点
        higherBound = middle - 1; // 场景1：查找范围上限太大，需要减小，更新中间值
        if (higherBound > 0 && matches[higherBound].position < position) {
          return middle; // 场景2：上限已经是要查找的后一个匹配项了，下个匹配项的偏移量会小于查找起点。
        }
      } else {
        return middle; // 直接命中查找起点，选择此匹配项
      }
    }
    // 查找起点不在 match 范围内，要么在范围前面，要么在范围后面
    const first = lowerBound > 0 ? lowerBound - 1 : 0;
    const match = matches[first];
    return match.position >= position ? first : undefined;
  }

  /**
   * Build the regular expression to use for searching.
   *
   * @param queryString Query string
   * @param caseSensitive Whether the search is case sensitive or not
   * @param regex Whether the expression is a regular expression
   * @returns The regular expression to use
   */
  parseQuery(
    queryString: string,
    caseSensitive: boolean,
    regex: boolean,
  ): RegExp | undefined {
    const flag = caseSensitive ? 'g' : 'gi';
    // escape regex characters in query if its a string search
    const queryText = regex
      ? queryString
      : queryString.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
    try {
      const ret = new RegExp(queryText, flag);
      // If the empty string is hit, the search logic will freeze the browser tab
      //  Trying /^/ or /$/ on the codemirror search demo, does not find anything.
      //  So this is a limitation of the editor.
      if (ret.test('')) {
        return undefined;
      }

      return ret;
    } catch (error) {
      return undefined;
    }
  }
}
