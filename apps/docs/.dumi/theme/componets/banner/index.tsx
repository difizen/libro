import { Link, useSiteData } from 'dumi';
import React, { useEffect, useState } from 'react';
import './index.less';

const Banner: React.FC = () => {
  const [animate, setAnimate] = useState({
    imgOpacity: 0,
    imgTranslate: 'none',
  });
  const { themeConfig } = useSiteData();

  useEffect(() => {
    setAnimate({
      imgOpacity: 1,
      imgTranslate: ` translateY(-14px)`,
    });
  }, []);

  if (!themeConfig.banner) {
    return null;
  }

  const bottons = themeConfig.banner.botton || [];

  return (
    <div className="difizen-dumi-banner">
      <div className="difizen-dumi-banner-main">
        {themeConfig.banner.coverImage ? (
          <>
            <div
              className="difizen-dumi-banner-content"
              style={{
                opacity: animate.imgOpacity,
                transform: animate.imgTranslate,
              }}
            >
              <div className="difizen-dumi-banner-content-title">
                {themeConfig.banner.title}
              </div>
              <div className="difizen-dumi-banner-content-detail">
                <p>{themeConfig.banner.desc}</p>
              </div>
              <div className="difizen-dumi-banner-content-actions">
                {bottons.map((it: { link: string; name: string }) => {
                  return (
                    <Link
                      style={{
                        margin: '0 8px',
                        textDecoration: 'none',
                        border: '1px dashed #d9d9d9',
                        backgroundColor: '#fff',
                        padding: '4px 15px',
                        color: 'rgba(0, 0, 0, 0.88)',
                      }}
                      to={it.link}
                      key={`${it.name}-${it.link}`}
                    >
                      {it.name}{' '}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div>
              <img
                className="difizen-dumi-banner-img"
                style={{
                  transition: 'all 1s ease-out',
                  opacity: animate.imgOpacity,
                  transform: animate.imgTranslate,
                }}
                src="https://mdn.alipayobjects.com/huamei_usjdcg/afts/img/A*BQWiQbC8LkMAAAAAAAAAAAAADo6HAQ/original"
              />
            </div>
          </>
        ) : (
          <div className="difizen-dumi-hero">
            <h1 className="difizen-dumi-hero-title">
              <span>{themeConfig.banner.title}</span>
            </h1>
            <p className="difizen-dumi-hero-desc">{themeConfig.banner.desc}</p>
            <div className="difizen-dumi-hero-actions">
              {bottons.map(({ name, link }, index) => {
                const style =
                  index === 0
                    ? {
                        color: '#fff',
                        backgroundColor: '#1677ff',
                      }
                    : {};
                return /^(\w+:)\/\/|^(mailto|tel):/.test(link) ? (
                  <a
                    style={style}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    key={name}
                  >
                    {name}
                  </a>
                ) : (
                  <Link style={style} key={name} to={link}>
                    {name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Banner;
