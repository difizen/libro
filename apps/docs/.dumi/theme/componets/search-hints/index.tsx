import { Empty, Spin } from 'antd';
import Paragraph from 'antd/es/typography/Paragraph';
import { Link } from 'dumi';
import React from 'react';
import './index.less';

interface ISearchHits {
  setVisible: (v: boolean) => void;
  hitsResult: ISearchResult[];
  loading: boolean;
}

interface IHighlightText {
  highlighted?: boolean;
  text: string;
}

interface ISearchResult {
  type: 'page' | 'title' | 'demo' | 'content';
  link: string;
  priority: number;
  highlightTitleTexts: IHighlightText[];
  highlightTexts: IHighlightText[];
}

function SearchHits({ loading, hitsResult, setVisible }: ISearchHits) {
  return (
    <>
      {loading && !hitsResult?.length ? (
        <div className="difizen-dumi-search-hint-center">
          <Spin />
        </div>
      ) : null}
      {!loading || hitsResult?.length
        ? hitsResult?.slice(0, 30).map((hit) => {
            return (
              <Link to={hit.link} key={hit.link}>
                <div
                  className="difizen-dumi-search-hint"
                  onClick={() => setVisible(false)}
                >
                  <Paragraph ellipsis={{ rows: 1 }}>
                    {hit.highlightTitleTexts.map((titleText, index) => {
                      return (
                        <span
                          className="difizen-dumi-search-hint-title"
                          key={'hit-title-' + index}
                        >
                          {titleText.highlighted ? (
                            <span className="difizen-dumi-search-hint-highlight">
                              {titleText.text}
                            </span>
                          ) : (
                            titleText.text
                          )}
                        </span>
                      );
                    })}
                  </Paragraph>

                  <Paragraph ellipsis={{ rows: 3 }}>
                    {hit.highlightTexts.map((text, index) => {
                      return (
                        <span
                          className="difizen-dumi-search-hint-desc"
                          key={'hit-text-' + index}
                        >
                          {text.highlighted ? (
                            <span className="difizen-dumi-search-hint-highlight">
                              {text.text}
                            </span>
                          ) : (
                            text.text
                          )}
                        </span>
                      );
                    })}
                  </Paragraph>
                </div>
              </Link>
            );
          })
        : null}
      <div className="difizen-dumi-search-hint-bottom">
        <div className="difizen-dumi-search-hint-center">
          {!loading && !hitsResult?.length ? <Empty /> : '仅显示前 30 条记录'}
        </div>
      </div>
    </>
  );
}

export default SearchHits;
