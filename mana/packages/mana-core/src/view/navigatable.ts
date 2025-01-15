import { URI } from '@difizen/mana-common';

import type { NavigatableView, NavigatableViewOptions } from './navigatable-types';
import type { ViewOpenHandlerOptions } from './view-open-handler';
import { ViewOpenHandler } from './view-open-handler';

export abstract class NavigatableViewOpenHandler<
  W extends NavigatableView,
> extends ViewOpenHandler<W> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected createViewOptions(
    uri: URI,
    options?: ViewOpenHandlerOptions,
  ): NavigatableViewOptions {
    return {
      kind: 'navigatable',
      uri: this.serializeUri(uri),
      ...options?.viewOptions,
    };
  }

  protected serializeUri(uri: URI): string {
    if (uri.scheme === 'file') {
      return URI.withFragment(uri).normalizePath().toString();
    } else {
      return URI.withFragment(uri).toString();
    }
  }
}
