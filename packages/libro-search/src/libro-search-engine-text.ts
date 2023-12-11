import type { SearchMatch } from '@difizen/libro-code-editor';

/**
 * Search for regular expression matches in a string.
 *
 * @param query Query regular expression
 * @param data String to look into
 * @returns List of matches
 */

export const searchText = (query: RegExp, data: string): Promise<SearchMatch[]> => {
  let searchData = data;
  let searchQuery = query;
  if (typeof searchData !== 'string') {
    try {
      searchData = JSON.stringify(searchData);
    } catch (reason) {
      console.warn('Unable to search.', reason, searchData);
      return Promise.resolve([]);
    }
  }
  if (!searchQuery.global) {
    searchQuery = new RegExp(searchQuery.source, searchQuery.flags + 'g');
  }
  const matches: SearchMatch[] = [];
  let match: RegExpExecArray | null = null;
  while ((match = searchQuery.exec(data)) !== null) {
    matches.push({
      text: match[0],
      position: match.index,
    });
  }
  return Promise.resolve(matches);
};
