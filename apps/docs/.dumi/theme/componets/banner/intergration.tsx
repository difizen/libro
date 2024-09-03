import { Row, Col } from 'antd';
import React from 'react';
import type { FC } from 'react';
import './index.less';

export const IntergractionSection: FC = () => {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
      <p className="feature-title">谁在使用</p>
      <Row className="user-container">
        <Col sm={12} md={8} lg={6} >
          <a className="user-item" href="https://github.com/secretflow/secretnote" target="_blank" rel="noreferrer">
            <img
                className="user-item-img"
                style={{ padding: '8px 10px' }}
                src="https://mdn.alipayobjects.com/huamei_yof94z/afts/img/A*gf6pQ6rQ9BcAAAAAAAAAAAAADrbYAQ/original"
              ></img>
          </a>
        </Col>
        <Col sm={12} md={8} lg={6}>
          <a className="user-item" href="https://zhu.alipay.com/" target="_blank" rel="noreferrer">
            <img
              className="user-item-img"
              style={{ padding: '0 16px' }}
              src="https://mdn.alipayobjects.com/huamei_zabatk/afts/img/A*9i21QahlJQsAAAAAAAAAAAAADvyTAQ/original"
            ></img>
          </a>
        </Col>
        <Col  sm={12} md={8} lg={6}>
          <div className="user-item">

            <img
              className="user-item-img"
              src="https://mdn.alipayobjects.com/huamei_zabatk/afts/img/A*6sSeQYF68WAAAAAAAAAAAAAADvyTAQ/original"
            ></img>
          </div>
        </Col>
        <Col sm={12} md={8} lg={6}>
          <a className="user-item" href="https://opensumi.com" target="_blank" rel="noreferrer">
            <img
              className="user-item-img user-item-img-sm"
              src="https://mdn.alipayobjects.com/huamei_zabatk/afts/img/A*7HyaQIPL1KYAAAAAAAAAAAAADvyTAQ/original"
            ></img>
          </a>
        </Col>
      </Row>
    </div>
  );
};
