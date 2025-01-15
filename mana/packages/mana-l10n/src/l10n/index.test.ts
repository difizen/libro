/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';

import { L10nLang, Localization } from '.';

let l10n: Localization;

describe('l10n', () => {
  beforeEach(() => {
    l10n = new Localization();
    l10n.changeLang(L10nLang.enUS);
  });

  it('fallsback when no bundle', () => {
    assert.strictEqual(l10n.t('message'), 'message');
  });

  it('load from contents', () => {
    l10n.loadLang(L10nLang.enUS, {
      contents: {
        message: 'translated message',
      },
    });

    assert.strictEqual(l10n.getLang(), L10nLang.enUS);

    assert.strictEqual(l10n.t('message'), 'translated message');
  });

  it('supports index args', () => {
    l10n.loadLang(L10nLang.enUS, {
      contents: {
        message: 'translated {0} message {1}',
      },
    });

    assert.strictEqual(l10n.t('message', 'foo', 'bar'), 'translated foo message bar');
  });

  it('supports record args', () => {
    l10n.loadLang(L10nLang.enUS, {
      contents: {
        message: 'translated {this} message {that}',
      },
    });

    assert.strictEqual(
      l10n.t('message', { this: 'foo', that: 'bar' }),
      'translated foo message bar',
    );
  });

  it('supports comments', () => {
    const message = 'message';
    const comment = 'This is a comment';
    const result = 'translated message';

    const key = `${message}/${comment}`;

    l10n.loadLang(L10nLang.enUS, {
      contents: {
        [key]: { message: result, comment: [comment] },
      },
    });

    // Normally we would be more static in the declaration of the object
    // in order to extract them properly but for tests we don't need to do that.
    assert.strictEqual(
      l10n.t({
        message,
        comment: [comment],
      }),
      result,
    );
  });

  it('supports index args and comments', () => {
    const message = 'message {0}';
    const comment = 'This is a comment';
    const result = 'translated message foo';

    const key = `${message}/${comment}`;

    l10n.loadLang(L10nLang.enUS, {
      contents: {
        [key]: { message: 'translated message {0}', comment: [comment] },
      },
    });

    // Normally we would be more static in the declaration of the object
    // in order to extract them properly but for tests we don't need to do that.
    assert.strictEqual(
      l10n.t({
        message,
        comment: [comment],
        args: ['foo'],
      }),
      result,
    );
  });

  it('supports object args and comments', () => {
    const message = 'message {this}';
    const comment = 'This is a comment';
    const result = 'translated message foo';

    const key = `${message}/${comment}`;

    l10n.loadLang(L10nLang.enUS, {
      contents: {
        [key]: { message: 'translated message {this}', comment: [comment] },
      },
    });

    // Normally we would be more static in the declaration of the object
    // in order to extract them properly but for tests we don't need to do that.
    assert.strictEqual(
      l10n.t({
        message,
        comment: [comment],
        args: { this: 'foo' },
      }),
      result,
    );
  });

  it('supports template literals', () => {
    l10n.loadLang(L10nLang.enUS, {
      contents: {
        'original {0} message {1}': 'translated {0} message {1}',
      },
    });

    const a = 'foo';
    const b = 'bar';
    assert.strictEqual(
      l10n.t`original ${a} message ${b}`,
      'translated foo message bar',
    );
  });
});
