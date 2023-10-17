import { useSiteData } from 'dumi';
import React from 'react';
import './Footer.less';

type DatumType = {
  title: string;
  itemList: {
    name: string;
    link: string;
  }[];
};

const Footer: React.FC = () => {
  const { themeConfig } = useSiteData();

  return (
    <div className="difizen-dumi-footer">
      <div className="difizen-dumi-footer-content">
        <div className="difizen-dumi-footer-text-group">
          {themeConfig['linksTitle']}
        </div>
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
        <div className="difizen-dumi-footer-text-group">
          <div className="difizen-dumi-footer-image-text">联系我们</div>
          {themeConfig['groupQR'] && (
            <div className="difizen-dumi-footer-image-group">
              <img className="difizen-dumi-footer-img" src={themeConfig['groupQR']} />
            </div>
          )}
        </div>
      </div>

      <div className="difizen-dumi-footer-extra">{themeConfig.footer}</div>
    </div>
  );
};

export default Footer;
