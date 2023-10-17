import { useSiteData } from 'dumi';
import React from 'react';
import './index.less';

import CarouselRoadMap from '../carousel-roadmap';

const rollContent = [
  {
    key: 'dot',
    type: 'span',
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginRight: 24,
    },
    span: {
      width: 5,
      height: 5,
      border: '2px solid rgb(22 93 255 / 100%)',
      borderRadius: 10,
      backgroundColor: '#fff',
    },
  },
  {
    key: 'time',
    type: 'default',
    style: {
      margin: '10px 0',
      marginRight: 24,
      fontSize: 14,
      textAlign: 'center',
    },
  },
];

const content = [
  {
    key: 'version',
    type: 'default',
    style: {
      fontSize: 18,
      fontWeight: 400,
    },
  },
  {
    key: 'descList',
    type: 'list',
    style: {
      margin: '12px 0 0',
      fontSize: 14,
    },
    p: {
      margin: '5px 0',
      color: 'rgb(134 144 156 / 100%)',
      fontSize: '13px',
    },
  },
  {
    key: 'gotoDetail',
    type: 'link',
    style: {
      margin: '12px 0 0',
      fontSize: 14,
    },
  },
];

export const Roadmap: React.FC = () => {
  const { themeConfig } = useSiteData();
  const roadmapData = themeConfig.roadmapData || [];

  if (!roadmapData.length) {
    return null;
  }

  const extraContent = (
    <div
      style={{
        borderTop: '3px dashed rgb(134 144 156 / 20%)',
      }}
    />
  );

  return (
    <div className="difizen-dumi-roadmap">
      <CarouselRoadMap
        carouselData={roadmapData}
        titleInfo={{
          title: '开源计划',
          marginTop: 0,
          marginBottom: 20,
        }}
        extraContent={extraContent}
        content={content}
        rollContent={rollContent}
      />
    </div>
  );
};
