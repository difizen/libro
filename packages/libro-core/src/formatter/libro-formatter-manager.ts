import type { Contribution } from '@difizen/mana-app';
import { contrib, Priority, singleton } from '@difizen/mana-app';

import { CellModelContribution } from '../cell/index.js';

import {
  FormatterContribution,
  FormatterTransContribution,
} from './libro-formatter-protocol.js';
import type { DefaultEncodedFormatter } from './libro-formatter-protocol.js';

@singleton()
export class LibroFormatterManager<T, U> {
  @contrib(FormatterContribution)
  protected readonly formatterProvider: Contribution.Provider<FormatterContribution<T>>;
  @contrib(FormatterTransContribution)
  protected readonly formatterTransProvider: Contribution.Provider<
    FormatterTransContribution<T, U>
  >;
  protected readonly cellModelProvider: Contribution.Provider<CellModelContribution>;

  constructor(
    @contrib(CellModelContribution)
    cellModelProvider: Contribution.Provider<CellModelContribution>,
  ) {
    this.cellModelProvider = cellModelProvider;
  }

  protected findFormatterProvider(
    libroFormatter: string,
    options?: object,
  ): FormatterContribution<T> {
    const prioritized = Priority.sortSync(
      this.formatterProvider.getContributions(),
      (contribution) => contribution.canHandle(libroFormatter, options),
    );
    const sorted = prioritized.map((c) => c.value);
    return sorted[0]!;
  }

  protected findFormatterTransProvider(
    origin: string,
    target: string,
  ): FormatterTransContribution<T, U> {
    const prioritized = Priority.sortSync(
      this.formatterTransProvider.getContributions(),
      (contribution) => {
        if (origin === contribution.origin && target === contribution.target) {
          return contribution.priority;
        }
        return 1;
      },
    );
    const sorted = prioritized.map((c) => c.value);
    return sorted[0]!;
  }

  encode(libroFormatter: string, source: T): DefaultEncodedFormatter {
    const formatter = this.findFormatterProvider(libroFormatter);
    return formatter.encode(source);
  }

  decode(libroFormatter: string, formatterValue: DefaultEncodedFormatter): T {
    const formatter = this.findFormatterProvider(libroFormatter);
    return formatter.decode(formatterValue);
  }

  adapter(libroFormatter: string, formatterValue: DefaultEncodedFormatter): U {
    const originFormatter = this.findFormatterProvider(
      formatterValue.metadata.libroFormatter,
    );
    const originDecodedValue = originFormatter.decode(formatterValue);
    const targetFormatter = this.findFormatterProvider(libroFormatter);
    if (targetFormatter.validate(originDecodedValue)) {
      return originDecodedValue as unknown as U;
    } else {
      const formatterTransProvider = this.findFormatterTransProvider(
        formatterValue.metadata.libroFormatter,
        libroFormatter,
      );
      const decodedValue = formatterTransProvider.decodedValueTrans(originDecodedValue);
      return decodedValue;
    }
  }
}
