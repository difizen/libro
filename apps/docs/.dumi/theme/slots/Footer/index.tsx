import { useSiteData } from 'dumi';
import React from 'react';
import './index.less';

type DatumType = {
  title: string;
  itemList: {
    name: string;
    link: string;
  }[];
};

const Footer: React.FC = () => {
  const { themeConfig } = useSiteData();
  const qrcodes = themeConfig.qrcodes;

  return (
    <div className="difizen-dumi-footer">
      <div className="difizen-dumi-footer-content">
        {/* <div className="difizen-dumi-footer-text-group">
          {themeConfig['linksTitle']}
        </div> */}
        {(themeConfig['links'] || []).map((datum: DatumType) => (
          <div className="difizen-dumi-footer-text-group" key={datum.title}>
            <div className="difizen-dumi-footer-title">{datum.title}</div>
            {datum.itemList.map((item) => (
              <div className="difizen-dumi-footer-item" key={item.name}>
                <a href={item.link} target="_blank" rel="noreferrer">
                  {item.name}
                </a>
              </div>
            ))}
          </div>
        ))}

        <div className="difizen-dumi-footer-text-group"></div>
        <div className="difizen-dumi-footer-text-group">
          <div className="difizen-dumi-footer-title">联系我们</div>
          {qrcodes.map((item: { name: string; qrcode: string }) => (
            <div className="difizen-dumi-footer-image-group" key={item.name}>
              <img className="difizen-dumi-footer-img" src={item.qrcode} />
              <label>{item.name}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="difizen-dumi-footer-extra">{themeConfig.footer}</div>
    </div>
  );
};

export default Footer;
