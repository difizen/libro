import React, { useEffect, useMemo, useRef, useState } from 'react';

import useAnimate from '../../hooks/useAnimate';
import { useWindowSize } from '../../hooks/useWindowSize';
import { Title } from '../title';
import './index.less';

interface IProps {
  carouselData: Record<string, any>[];
  titleInfo: Record<string, any>;
  content: Record<string, any>[];
  extraContent?: any;
  rollContent?: Record<string, any>[];
  cardStyle?: Record<string, any>;
  buttonStyle?: Record<string, any>;
  startFromBeginning?: boolean;
}

const CarouselRoadMap: React.FC<IProps> = (props) => {
  const {
    carouselData,
    titleInfo,
    content,
    extraContent,
    rollContent,
    cardStyle,
    buttonStyle,
    startFromBeginning,
  } = props;
  const [rollingWidth, setRollingWidth] = useState<number>(0);
  const { width: wWidth } = useWindowSize();

  const refs = useRef<Record<string, HTMLDivElement>>({});
  const roadmapRef = useRef<HTMLDivElement>(null);

  const animate = useAnimate({
    scrollHeight: 1650,
    beforeEffect: {
      opacity: 0,
      translate: 'translateY(30px)',
    },
    afterEffect: {
      opacity: 1,
      translate: ` translateY(0px)`,
    },
  });

  const marginRight = 24;
  const boxWidth = 280;

  const isDisabledPrevBtn = rollingWidth === 0;

  const roadWidth = useMemo(() => {
    let rWidth = 0;

    if (wWidth > 1420) {
      rWidth = 1192;
    } else if (wWidth <= 1420 && wWidth > 1140) {
      rWidth = 888;
    } else if (wWidth <= 1140 && wWidth > 840) {
      rWidth = 584;
    } else if (wWidth <= 840) {
      rWidth = 280;
    }

    return rWidth;
  }, [wWidth]);

  useEffect(() => {
    if (startFromBeginning) {
      return;
    }
    // should refactor
    const boxCount = (roadWidth + marginRight) / (boxWidth + marginRight);
    const totalCount = carouselData.length;

    const moveCount = totalCount - boxCount - 1;
    setRollingWidth(-moveCount * (boxWidth + marginRight));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carouselData.length]);

  /**
   * 处理 NextBtn 的禁用逻辑
   */
  const isDisabledNextBtn = useMemo(() => {
    const count = Math.ceil(roadWidth / (boxWidth + marginRight));

    return (
      carouselData.length * (boxWidth + marginRight) -
        count * (boxWidth + marginRight) +
        rollingWidth ===
      0
    );
  }, [rollingWidth, roadWidth, carouselData.length]);

  /**
   * 响应式调整 roadmap 结尾处展示逻辑
   */
  useEffect(() => {
    const isOutOfRange =
      Math.abs(rollingWidth) +
      roadWidth -
      (carouselData.length * (boxWidth + marginRight) - marginRight);

    if (isOutOfRange > 0) {
      setRollingWidth(rollingWidth + isOutOfRange);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roadWidth, carouselData.length]);

  return (
    <div className="difizen-dumi-carousel">
      <Title marginTop={titleInfo.marginTop} marginBottom={40}>
        {titleInfo.title}
      </Title>
      <div className="difizen-dumi-carousel-line">
        {extraContent}
        <button
          type="button"
          disabled={isDisabledPrevBtn}
          style={buttonStyle}
          className={`difizen-dumi-carousel-rolling-btn difizen-dumi-carousel-prev-btn ${
            isDisabledPrevBtn ? 'difizen-dumi-carousel-rolling-btn-disabled' : ''
          }`}
          onClick={() => {
            if (rollingWidth >= 0) {
              return;
            }
            setRollingWidth(rollingWidth + (boxWidth + marginRight));
          }}
        >
          {'<'}
        </button>
        <button
          type="button"
          disabled={isDisabledNextBtn}
          style={buttonStyle}
          className={`difizen-dumi-carousel-rolling-btn difizen-dumi-carousel-next-btn ${
            isDisabledNextBtn ? 'difizen-dumi-carousel-rolling-btn-disabled' : ''
          }`}
          onClick={() => {
            setRollingWidth(rollingWidth - (boxWidth + marginRight));
          }}
        >
          {'>'}
        </button>
      </div>
      <div
        className="difizen-dumi-carousel-roadmap"
        ref={roadmapRef}
        style={{
          opacity: animate.opacity,
          transform: animate.translate,
        }}
      >
        <div
          className="difizen-dumi-carousel-roadmap-container"
          style={{ marginLeft: rollingWidth }}
        >
          {carouselData.map((data) => {
            return (
              <div
                className="difizen-dumi-carousel-roadmap-card-container"
                key={data.id}
              >
                {rollContent?.map((item) => (
                  <>
                    <div style={item.style}>
                      {item.type === 'span' && <span style={item.span} />}
                      {data?.[item.key]}
                    </div>
                  </>
                ))}
                <div
                  className="difizen-dumi-carousel-roadmap-card"
                  style={cardStyle}
                  ref={(el) => el && (refs.current[data.id] = el)}
                  key={data.id}
                >
                  {content?.map((item) => (
                    <>
                      {item.type === 'default' && (
                        <div style={item.style}>{data[item.key]}</div>
                      )}
                      {item.type === 'img' && (
                        <div style={item.style}>
                          <img style={{ width: '100%' }} src={data.img} />
                          {data[item.key]}
                        </div>
                      )}
                      {item.type === 'link' &&
                        data?.version !== 'next' &&
                        data?.link && (
                          <div style={item.style}>
                            <a href={data.link} target="_blank" rel="noreferrer">
                              {'查看详情 >'}
                            </a>
                          </div>
                        )}
                      {item.type === 'list' && (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            height: '100%',
                          }}
                        >
                          {data.version !== 'next' ? (
                            data.descList.map((desc: string) => {
                              return (
                                <p style={item.p} key={desc}>
                                  {desc}
                                </p>
                              );
                            })
                          ) : (
                            <div className="goto-detail">
                              <h1
                                style={{
                                  fontSize: 70,
                                  color: '#dddddd',
                                  margin: '12px 0',
                                }}
                              >
                                ?
                              </h1>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CarouselRoadMap;
