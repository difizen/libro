import { Row, Col } from 'antd';
import React from 'react';
import type { FC } from 'react';
import './index.less';

export const IntergractionSection: FC = () => {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
      <p className="feature-title">谁在使用</p>
      <div className="user-item-container">
        <Row>
          <Col span={6}>
            <img
              className="user-item"
              style={{ padding: '8px 10px' }}
              src="https://mdn.alipayobjects.com/huamei_yof94z/afts/img/A*gf6pQ6rQ9BcAAAAAAAAAAAAADrbYAQ/original"
            ></img>
          </Col>
          <Col span={6}>
            <img
              className="user-item"
              style={{ padding: '0 16px' }}
              src="https://mdn.alipayobjects.com/huamei_zabatk/afts/img/A*9i21QahlJQsAAAAAAAAAAAAADvyTAQ/original"
            ></img>
          </Col>
          <Col span={6}>
            <img
              className="user-item"
              src="https://mdn.alipayobjects.com/huamei_zabatk/afts/img/A*6sSeQYF68WAAAAAAAAAAAAAADvyTAQ/original"
            ></img>
          </Col>
          <Col span={6}>
            <img
              className="user-item"
              src="https://mdn.alipayobjects.com/huamei_zabatk/afts/img/A*zQMHTJ5CJiMAAAAAAAAAAAAADvyTAQ/original"
            ></img>
          </Col>
        </Row>
      </div>
    </div>
  );
};
