import { l10n } from '@difizen/mana-l10n';
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
  const links = [
    {
      name:  l10n.t('official website'),
      link: 'https://libro.difizen.net/',
    },
    {
      name: l10n.t('Github address'),
      link: 'https://github.com/difizen/libro',
    },
  ]

  const qrcodes = [
    {
      name: l10n.t('DingTalk'),
      qrcode: '/ding-qrcode.png',
    },
  ];

  return (
    <div className="difizen-dumi-footer">
      <div className="difizen-dumi-footer-content">
        <div className="difizen-dumi-footer-text-group px-8">
          <h3 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">{l10n.t('Contact Us：')}</h3>
          {links.map((link, i) => (
            <p className="text-muted-foreground difizen-dumi-footer-item" key={i}>
              <a href={link.link} target="_blank" rel="noreferrer" key={i}>
                {link.name}：{link.link}
              </a>
            </p>
          ))}
          {qrcodes.map((item: { name: string; qrcode: string }) => (
            <div key={item.name}>
              <img className="difizen-dumi-footer-img" src={item.qrcode} />
              {/*<label>{item.name}</label>*/}
            </div>
          ))}
        </div>
      </div>
      <div className="difizen-dumi-footer-extra">{themeConfig.footer}</div>
    </div>
  );
};

export default Footer;
