import { l10n } from '@difizen/mana-l10n';
import type { FC } from 'react';
import React from 'react';

export const HeroSection: FC = () => {
  return (
    <div className="mb-16 from-zinc-50 to-white dark:from-zinc-950 to-black relative">
      <div className="absolute bg-[url('/_convertfast/gradient-bg-0.svg')] bg-auto bg-no-repeat z-0 inset-0 top-0 bottom-0 left-0 right-0 grayscale"></div>
      <div
        className="max-w-7xl mx-auto px-8 sm:px-6 lg:px-8 py-8 sm:py-24 lg:py-32 relative z-10">
        <div className="max-w-3xl">
          <p className="text-base sm:text-2xl text-muted-foreground mb-4 mt-6">
            {l10n.t('Flexible customization and easy integration of Notebook product solutions.')}
          </p>
        </div>
        <img
          alt="app screenshot"
          src="/libro.png"
          width={2432}
          height={1442}
          className="mt-6 rounded-md shadow-2xl border sm:mt-12 block dark:hidden border-none"
        />
        <img
          alt="app screenshot"
          src="/libro.png"
          width={2432}
          height={1442}
          className="mt-6 rounded-md shadow-2xl border sm:mt-12 hidden dark:block border-none"
        />
      </div>
    </div>
  );
}
