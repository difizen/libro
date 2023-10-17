import { Col, Row } from 'antd';
import { useSiteData } from 'dumi';
import React, { useEffect, useState } from 'react';

import useScroll from '../../hooks/useScroll';
import { useWindowSize } from '../../hooks/useWindowSize';
import { Title } from '../title';

const TechCard: React.FC = () => {
  const scroll = useScroll();
  const { height } = useWindowSize();
  const { themeConfig } = useSiteData();

  const [animate, setAnimate] = useState({
    opacity: 0,
    translate: 'translateY(30px)',
  });

  useEffect(() => {
    if (scroll + height > 1200) {
      setAnimate({
        opacity: 1,
        translate: ` translateY(0px)`,
      });
    } else {
      setAnimate({
        opacity: 0,
        translate: ` translateY(30px)`,
      });
    }
  }, [scroll, height]);

  const data = themeConfig.techCardData;

  if (!data) {
    return null;
  }
  const spanNum = Math.floor(24 / data.length);

  return (
    <>
      <Title marginTop={80} marginBottom={40}>
        技术名片
      </Title>
      <div style={{ width: '100%' }}>
        <div
          style={{
            maxWidth: '1200px',
            margin: 'auto',
            paddingInline: '40px',
          }}
        >
          <Row gutter={[24, 24]}>
            {data.map(
              (
                datum: {
                  id: React.Key | undefined;
                  iconSrc: string | undefined;
                  title:
                    | boolean
                    | React.ReactChild
                    | React.ReactFragment
                    | React.ReactPortal
                    | null
                    | undefined;
                  desc:
                    | boolean
                    | React.ReactChild
                    | React.ReactFragment
                    | React.ReactPortal
                    | null
                    | undefined;
                },
                index: number,
              ) => {
                return (
                  <Col className="gutter-row" key={index} span={spanNum}>
                    <div
                      style={{
                        opacity: animate.opacity,
                        transform: animate.translate,
                        display: 'flex',
                        boxSizing: 'border-box',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: '24px',
                        borderRadius: '10px',
                        backgroundColor: '#fff',
                        textAlign: 'center',
                        transition: 'all 0.6s ease-out',
                      }}
                      key={datum.id}
                    >
                      <img
                        style={{
                          width: '64px',
                          margin: 'auto',
                          textAlign: 'center',
                        }}
                        src={datum.iconSrc}
                      />
                      <h1
                        style={{
                          margin: '12px 0 8px',
                          color: 'rgb(29 33 41 / 100%)',
                          fontSize: '20px',
                          fontWeight: 500,
                        }}
                      >
                        {datum.title}
                      </h1>
                      <p
                        style={{
                          padding: 0,
                          margin: 0,
                          color: 'rgb(134 144 156 / 100%)',
                          fontSize: '14px',
                          fontWeight: 400,
                          lineHeight: '24px',
                        }}
                      >
                        {datum.desc}
                      </p>
                    </div>
                  </Col>
                );
              },
            )}
          </Row>
        </div>
      </div>
    </>
  );
};

export default TechCard;
