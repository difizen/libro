import { l10n } from '@difizen/mana-l10n';
import { Button, message } from 'antd';
import { Link, useSiteData } from 'dumi';
import React, { useEffect, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './index.less';
import '../../tailwind.out.css';

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

  return (
    <div className="difizen-dumi-banner">
      <div className="difizen-dumi-banner-main">
        <div className="from-zinc-50 to-white dark:from-zinc-950 to-black relative">
          <div className="absolute bg-[url('/_convertfast/gradient-bg-0.svg')] bg-auto bg-no-repeat z-0 inset-0 top-0 bottom-0 left-0 right-0 grayscale"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32 relative z-10">
            <div className="max-w-3xl">
              <div className="content-animate">
                <div className="circle-first">
                  <div className="circle-first-one" />
                  <div className="circle-first-two" />
                </div>
                <div className="circle-second"></div>
                <div className="circle-third"></div>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary mb-6 drop-shadow-md">
                mana
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground mb-8">
                {l10n.t('A modular and extensible front-end framework')}
              </p>
              <Link to={'/introduction'}>
                <Button type="primary" size="large" className="start-btn">
                  Start now
                </Button>
              </Link>
              <CopyToClipboard
                text="npm install @difizen/mana-app"
                onCopy={() => {
                  message.success(l10n.t('Copied'));
                }}
              >
                <Button size="large" className="install-btn">
                  npm install @difizen/mana-app
                </Button>
              </CopyToClipboard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
