import { l10n } from '@difizen/mana-l10n';
import { Row, Col } from 'antd';
import React from 'react';
import type { FC } from 'react';
import './index.less';

export const IntergractionSection: FC = () => {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
      <p className="feature-title">{l10n.t('Who is using')}</p>
      <Row className="user-container">
        <Col sm={12} md={8} lg={6} >
          <a className="user-item" href="https://github.com/secretflow/secretnote" target="_blank" rel="noreferrer">
            <img
                className="user-item-img"
                style={{ padding: '8px 10px' }}
                src="/secrete_flow.png"
              ></img>
          </a>
        </Col>
        <Col sm={12} md={8} lg={6}>
          <a className="user-item" href="https://zhu.alipay.com/" target="_blank" rel="noreferrer">
            <img
              className="user-item-img"
              style={{ padding: '0 16px' }}
              src="/zhu_logo.png"
            ></img>
          </a>
        </Col>
        <Col  sm={12} md={8} lg={6}>
          <div className="user-item">

            <img
              className="user-item-img"
              src="/cloudlab.png"
            ></img>
          </div>
        </Col>
        <Col sm={12} md={8} lg={6}>
          <a className="user-item" href="https://opensumi.com" target="_blank" rel="noreferrer">
            <img
              className="user-item-img user-item-img-sm"
              src="/opensumi.png"
            ></img>
          </a>
        </Col>
      </Row>
    </div>
  );
};
