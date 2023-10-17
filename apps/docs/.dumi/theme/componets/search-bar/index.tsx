import { SearchOutlined } from '@ant-design/icons';
import { useSiteSearch } from 'dumi';
import React, { useEffect, useRef, useState } from 'react';
import './index.less';

import SearchHits from '../search-hints/index.js';

const SearchBar: React.FC = () => {
  const [visible, setVisible] = useState(false);

  const { keywords, setKeywords, result, loading } = useSiteSearch();
  const hitsResult = result
    .map((res) => {
      if (res.title) {
        return res.hints;
      }
      return [];
    })
    .flat();

  const searchBarRef = useRef<HTMLDivElement>(null);
  const resultPanelRef = useRef<HTMLDivElement>(null);

  const hasQuery = Boolean(keywords);

  useEffect(() => {
    setVisible(hasQuery);
  }, [hasQuery]);

  useEffect(() => {
    // we are tracking the search bar and the result dropdown
    const refs = [searchBarRef, resultPanelRef];

    // we will be using focus events to track interactions
    const listener: (e: FocusEvent) => void = (e) => {
      switch (e.type) {
        case 'focusin':
          // if tracked elements has focus, reveal the dropdown
          // if the query isn't empty
          setVisible(hasQuery);
          break;

        case 'focusout':
          // several things can happen here:
          //
          // 1. our elements lose focus because the user interacted with something
          // outside of them (e.g. page content, another tab, etc.)
          // 2. our elements lose focus because the user interacted with an element
          // _within_ them, e.g. a link in the dropdown, and that element gained focus
          //
          // we wish to hide the dropdown in case 1, but not in case 2
          // we use relatedTarget, which, for focus events, would be the element
          // that caused the focus change
          //
          // caveat: the user may interact with an element that is not focusable
          // in which case relatedTarget would be null, even if that element is
          // still within our tracked elements
          if (
            e.relatedTarget === null ||
            refs.every(
              (ref) =>
                ref.current !== e.relatedTarget &&
                !ref.current?.contains(e.relatedTarget as Node),
            )
          ) {
            setVisible(false);
            setKeywords('');
          }
          break;
      }
    };

    // Honestly we could probably just use :focus-within for this
    refs.forEach(({ current }) => {
      current?.addEventListener('focusin', listener);
      current?.addEventListener('focusout', listener);
    });
    return () => {
      refs.forEach(({ current }) => {
        current?.removeEventListener('focusin', listener);
        current?.removeEventListener('focusout', listener);
      });
    };
  }, [hasQuery, setKeywords]);

  return (
    <>
      {/* 搜索框 */}
      <div className="difizen-dumi-search-bar-input-container" ref={searchBarRef}>
        <input
          className="difizen-dumi-search-bar-input"
          id="pc-search-input"
          placeholder="请输入关键词搜索文档"
          value={keywords}
          onChange={(e) => {
            setKeywords(e?.target?.value);
          }}
          autoComplete="off"
        />
        <SearchOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
      </div>
      {/* 搜索结果 */}
      {visible ? (
        <div
          className="difizen-dumi-search-bar-hint"
          ref={resultPanelRef}
          tabIndex={0}
          role="menu"
          onBlur={() => {
            setKeywords('');
          }}
          id="pc-hits"
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              paddingLeft: 12,
              boxSizing: 'border-box',
              margin: '6px 0',
            }}
          >
            <small style={{ color: '#999' }}>搜索结果</small>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 400 }}>
            <SearchHits
              loading={loading && hasQuery}
              setVisible={() => {
                setKeywords('');
              }}
              hitsResult={hitsResult}
            />
          </div>
        </div>
      ) : null}
    </>
  );
};

export default SearchBar;
