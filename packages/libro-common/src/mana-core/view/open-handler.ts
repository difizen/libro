import type { MaybePromise, Event, Disposable, URI } from '@difizen/mana-common';
import { Priority } from '@difizen/mana-common';
import type { Contribution } from '@difizen/mana-syringe';
import { singleton, contrib, Syringe } from '@difizen/mana-syringe';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OpenerOptions {}

export const OpenHandler = Syringe.defineToken('OpenHandler');
/**
 * `OpenHandler` should be implemented to provide a new opener.
 */
export interface OpenHandler {
  /**
   * A unique id of this handler.
   */
  readonly id: string;
  /**
   * A human-readable name of this handler.
   */
  readonly label?: string;
  /**
   * A css icon class of this handler.
   */
  readonly iconClass?: string;
  /**
   * Test whether this handler can open the given resource for given options.
   * Return a nonzero number if this handler can open; otherwise it cannot.
   * Never reject.
   *
   * A returned value indicating a priority of this handler.
   */
  canHandle: (resource: URI, options?: OpenerOptions) => MaybePromise<number>;
  /**
   * Open a widget for the given resource and options.
   * Resolve to an opened widget or undefined, e.g. if a page is opened.
   * Never reject if `canHandle` return a positive number; otherwise should reject.
   */
  open: (
    resource: URI,
    options?: OpenerOptions,
  ) => MaybePromise<Record<any, any> | undefined>;
}

export const OpenerService = Symbol('OpenerService');
/**
 * `OpenerService` provide an access to existing openers.
 */
export interface OpenerService {
  /**
   * Return all registered openers.
   * Never reject.
   */
  getOpeners: (() => Promise<OpenHandler[]>) &
    ((resource: URI, options?: OpenerOptions) => Promise<OpenHandler[]>);
  /**
   * Return an opener with the higher priority for the given resource.
   * Reject if such does not exist.
   */
  getOpener: (resource: URI, options?: OpenerOptions) => Promise<OpenHandler>;
  /**
   * Add open handler i.e. for custom editors
   */
  addHandler?: (openHandler: OpenHandler) => Disposable;
  /**
   * Event that fires when a new opener is added or removed.
   */
  onDidChangeOpeners?: Event<void>;
}

export async function open(
  openerService: OpenerService,
  resource: URI,
  options?: OpenerOptions,
): Promise<Record<string, any> | undefined> {
  const opener = await openerService.getOpener(resource, options);
  return opener.open(resource, options);
}

@singleton({ contrib: OpenerService })
export class DefaultOpenerService implements OpenerService {
  protected readonly handlersProvider: Contribution.Provider<OpenHandler>;

  constructor(
    @contrib(OpenHandler)
    handlersProvider: Contribution.Provider<OpenHandler>,
  ) {
    this.handlersProvider = handlersProvider;
  }

  async getOpener(resource: URI, options?: OpenerOptions): Promise<OpenHandler> {
    const handlers = await this.prioritize(resource, options);
    if (handlers.length >= 1) {
      return handlers[0];
    }
    return Promise.reject(
      new Error(`There is no opener for resource: ${resource.toString()}.`),
    );
  }

  async getOpeners(resource?: URI, options?: OpenerOptions): Promise<OpenHandler[]> {
    return resource ? this.prioritize(resource, options) : this.getHandlers();
  }

  protected async prioritize(
    resource: URI,
    options?: OpenerOptions,
  ): Promise<OpenHandler[]> {
    const prioritized = await Priority.sort(this.getHandlers(), async (handler) => {
      try {
        return await handler.canHandle(resource, options);
      } catch {
        return 0;
      }
    });
    return prioritized.map((p) => p.value);
  }

  protected getHandlers(): OpenHandler[] {
    return [...this.handlersProvider.getContributions()];
  }
}
