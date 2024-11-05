import { l10n } from '@difizen/mana-l10n';
import { useSiteData, Link } from 'dumi';
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
      title: l10n.t('Related'),
      itemList: [
        {
          name: 'Difizen',
          link: 'https://github.com/difizen',
        },
        {
          name: 'Difizen｜libro',
          link: 'https://github.com/difizen/libro',
        },
        {
          name: 'Difizen｜mana',
          link: 'https://github.com/difizen/mana',
        },
        {
          name: 'Difizen｜magent',
          link: 'https://github.com/difizen/magent',
        },
      ],
    },
    {
      title: l10n.t('Community'),
      itemList: [
        {
          name:  l10n.t('feedback issues'),
          link: 'https://github.com/difizen/libro/issues',
        },
        {
          name:  l10n.t('release notes'),
          link: 'https://github.com/difizen/libro/releases',
        },
      ],
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
            <div className="difizen-dumi-footer-logo">
              {themeConfig.logo && (
                <Link to={themeConfig['link']}>
                  <img className="difizen-dumi-header-logo-img" src={themeConfig.logo} />
                </Link>
              )}
            </div>
            {links.map((datum: DatumType) => (
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
              <div className="difizen-dumi-footer-contact">{l10n.t('Contact Us')}</div>
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
