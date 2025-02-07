import { CodeOutlined } from '@ant-design/icons';
import { ConfigurationService } from '@difizen/mana-app';
import {
  Disposable,
  DisposableCollection,
  Emitter,
  KeyCode,
  ViewInstance,
  ViewOption,
  inject,
  isFirefox,
  isOSX,
  transient,
  useInject,
  view,
} from '@difizen/mana-app';
import { l10n } from '@difizen/libro-common/mana-l10n';
import { forwardRef } from 'react';
import type { FontWeight, ITerminalOptions } from 'xterm';
import { Terminal } from 'xterm';
import { CanvasAddon } from 'xterm-addon-canvas';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { WebglAddon } from 'xterm-addon-webgl';

import type { CursorStyle, TerminalRendererType } from './configuration.js';
import { terminalIntegratedCursorStyle } from './configuration.js';
import { terminalIntegratedCopyOnSelection } from './configuration.js';
import { terminalEnablePaste } from './configuration.js';
import { terminalEnableCopy } from './configuration.js';
import { terminalIntegratedRendererType } from './configuration.js';
import { terminalIntegratedFastScrollSensitivity } from './configuration.js';
import { terminalIntegratedScrollback } from './configuration.js';
import { terminalIntegratedLineHeight } from './configuration.js';
import { terminalIntegratedLetterSpacing } from './configuration.js';
import { terminalIntegratedDrawBoldTextInBrightColors } from './configuration.js';
import {
  terminalIntegratedCursorBlinking,
  terminalIntegratedCursorWidth,
  terminalIntegratedFontFamily,
  terminalIntegratedFontSize,
  terminalIntegratedFontWeight,
  terminalIntegratedFontWeightBold,
} from './configuration.js';
import {
  DEFAULT_TERMINAL_RENDERER_TYPE,
  isTerminalRendererType,
} from './configuration.js';
import type { TerminalConnection } from './connection.js';
import { TerminalManager } from './manager.js';
import type { TerminalMessage, TerminalViewOption } from './protocol.js';
import 'xterm/css/xterm.css';
import { BaseStatefulView } from './stateful-view.js';
import { TerminalThemeService } from './theme-service.js';

export const TerminalComponent = forwardRef<HTMLDivElement>(function TerminalComponent(
  _props: { top?: number },
  ref,
) {
  const instance = useInject<LibroTerminalView>(ViewInstance);

  return (
    <div
      id={instance.id}
      //  tabIndex={1}
      className="libro-terminal"
      ref={ref}
    ></div>
  );
});

@transient()
@view('libro-terminal-view')
export class LibroTerminalView extends BaseStatefulView {
  protected term: Terminal;
  override view = TerminalComponent;
  protected options: TerminalViewOption;
  protected termOpened = false;
  protected initialData = '';
  protected fitAddon: FitAddon;
  protected readonly config: ConfigurationService;
  protected readonly themeService: TerminalThemeService;
  protected readonly terminalManager: TerminalManager;

  protected readonly toDisposeOnConnect = new DisposableCollection();

  protected readonly onDidOpenEmitter = new Emitter<boolean>();
  readonly onDidOpen = this.onDidOpenEmitter.event;

  protected readonly onDidOpenFailureEmitter = new Emitter<unknown>();

  protected readonly onSizeChangedEmitter = new Emitter<{
    cols: number;
    rows: number;
  }>();

  protected readonly onDataEmitter = new Emitter<string>();

  protected readonly onKeyEmitter = new Emitter<{
    key: string;
    domEvent: KeyboardEvent;
  }>();

  protected readonly onDidCloseEmitter = new Emitter<LibroTerminalView>();

  protected readonly onTitleChangeEmitter = new Emitter<string>();

  protected connection?: TerminalConnection;

  protected restoreObj?: object;

  protected _isReady = false;

  protected onReadyEmitter = new Emitter<boolean>();

  constructor(
    @inject(ViewOption) options: TerminalViewOption, // 这里是 server需要的配置
    @inject(ConfigurationService) config: ConfigurationService,
    @inject(TerminalThemeService) themeService: TerminalThemeService,
    @inject(TerminalManager) terminalManager: TerminalManager,
  ) {
    super();
    this.options = options;
    this.title.icon = CodeOutlined;
    this.config = config;
    this.themeService = themeService;
    this.terminalManager = terminalManager;

    this.createTerm();
    // 设置自定义事件
    this.term.attachCustomKeyEventHandler((e) => {
      return this.customKeyHandler(e);
    });

    // 输入
    this.onData((data) => {
      if (this.isDisposed) {
        return;
      }
      if (this.connection) {
        this.connection.send({
          type: 'stdin',
          content: [data],
        });
      }
    });

    // dispose tern
    if (this.options.destroyOnClose === true) {
      this.toDispose.push(
        Disposable.create(() => {
          this.term.dispose();
        }),
      );
    }

    // 主题
    this.toDispose.push(
      this.themeService.onDidChange(
        () => (this.term.options.theme = this.themeService.getTheme()),
      ),
    );

    // server title
    this.toDispose.push(
      this.term.onTitleChange((title: string) => {
        if (this.options.useServerTitle) {
          this.title.label = title;
          this.onTitleChangeEmitter.fire(title);
        }
      }),
    );

    // dispose Emitter
    this.toDispose.push(this.onDidCloseEmitter);
    this.toDispose.push(this.onDidOpenEmitter);
    this.toDispose.push(this.onDidOpenFailureEmitter);
    this.toDispose.push(this.onSizeChangedEmitter);
    this.toDispose.push(this.onDataEmitter);
    this.toDispose.push(this.onKeyEmitter);

    // bind onSizeChanged
    this.toDispose.push(
      this.term.onResize((data) => {
        this.onSizeChangedEmitter.fire(data);
        this.setSessionSize();
      }),
    );

    // bind ondata
    this.toDispose.push(
      this.term.onData((data) => {
        this.onDataEmitter.fire(data);
      }),
    );

    this.toDispose.push(
      (() => {
        //  xterm 的 SGR（Select Graphic Rendition）鼠标模式（SGR Mouse Mode），对于特定类型的鼠标事件，xterm 将会发送相应的二进制数据到终端
        /**
         * Adds an event listener for when a binary event fires. This is used to
         * enable non UTF-8 conformant binary messages to be sent to the backend.
         * Currently this is only used for a certain type of mouse reports that
         * happen to be not UTF-8 compatible.
         * The event value is a JS string, pass it to the underlying pty as
         * binary data, e.g. `pty.write(Buffer.from(data, 'binary'))`.
         * @returns an `IDisposable` to stop listening.
         */
        return this.term.onBinary((data) => {
          this.onDataEmitter.fire(data);
        });
      })(),
    );

    // bind onKey
    this.toDispose.push(
      this.term.onKey((data) => {
        this.onKeyEmitter.fire(data);
      }),
    );
  }

  override afterRestore() {
    this.initConnection()
      .then((connection) => {
        this.terminalManager.terminalOptionsCache.set(connection.name, this.options);
        this._isReady = true;
        this.connection = connection;
        this.onReadyEmitter.fire(true);

        this.toDispose.push(connection.messageReceived(this.onMessage));
        this.toDispose.push(connection);

        const dispose = connection.connectionStatusChanged(() => {
          this.initOnceAfterConnected(dispose);
        });
        return connection;
      })
      .catch((e) => {
        console.error(e);
      });
  }
  async initConnection() {
    if (!this.restoreObj) {
      const connection = await this.createConnection();
      return connection;
    } else {
      const options = { ...this.options, ...this.restoreObj };
      const restoreConnection = await this.terminalManager.getOrCreate(options);
      return restoreConnection;
    }
  }

  storeState(): object {
    return { name: this.name };
  }

  restoreState(oldState: object): void {
    const state = oldState as { name: string };
    this.restoreObj = state;
  }

  // todo merge options to initcommand

  override dispose(): void {
    if (!this.connection?.disposed) {
      this.connection?.shutdown().catch((reason) => {
        console.error(`Terminal not shut down: ${reason}`);
      });
    }

    this.terminalManager.terminalOptionsCache.delete(this.name);

    super.dispose();
  }

  protected createConnection = async () => {
    const connection = await this.terminalManager.getOrCreate(this.options);
    return connection;
  };

  /**
   * Handle a message from the terminal session.
   */
  protected onMessage = (msg: TerminalMessage) => {
    switch (msg.type) {
      case 'stdout':
        if (msg.content) {
          this.term.write(msg.content[0] as string);
        }
        break;
      case 'disconnect':
        this.term.write(l10n.t('[Finished… Term Session]'));
        break;
      default:
        break;
    }
  };

  protected initOnceAfterConnected(dispose: Disposable) {
    if (this.isDisposed) {
      return;
    }
    if (this.connection?.connectionStatus !== 'connected') {
      return;
    }

    this.initialTitle();
    this.setSessionSize();
    this.initialCommand();
    // 只执行一次
    if (dispose) {
      dispose.dispose();
    }
  }

  // 设置初始命令
  protected initialCommand = () => {
    if (this.connection && this.options.initialCommand) {
      this.connection?.send({
        type: 'stdin',
        content: [this.options.initialCommand + '\r'],
      });
    }
  };

  // default title
  protected initialTitle() {
    if (this.connection?.connectionStatus !== 'connected') {
      return;
    }
    const title = `Terminal ${this.connection.name}`;
    this.title.label = title;
    this.onTitleChangeEmitter.fire(title);
  }

  protected createTerm = () => {
    const options = {
      cursorBlink: terminalIntegratedCursorBlinking.defaultValue,
      cursorStyle: this.getCursorStyle(),
      cursorWidth: terminalIntegratedCursorWidth.defaultValue,
      fontFamily: terminalIntegratedFontFamily.defaultValue,
      fontSize: terminalIntegratedFontSize.defaultValue,
      fontWeight: terminalIntegratedFontWeight.defaultValue as FontWeight,
      fontWeightBold: terminalIntegratedFontWeightBold.defaultValue as FontWeight,
      drawBoldTextInBrightColors:
        terminalIntegratedDrawBoldTextInBrightColors.defaultValue,
      letterSpacing: terminalIntegratedLetterSpacing.defaultValue,
      lineHeight: terminalIntegratedLineHeight.defaultValue,
      scrollback: terminalIntegratedScrollback.defaultValue,
      fastScrollSensitivity: terminalIntegratedFastScrollSensitivity.defaultValue,
      rendererType: this.getTerminalRendererType(
        terminalIntegratedRendererType.defaultValue,
      ),
      theme: this.themeService.getTheme(),
    };

    const [term, fitAddon] = this.createTerminal(options);
    this.fitAddon = fitAddon;
    this.term = term;
  };

  protected get enableCopy(): boolean {
    return terminalEnableCopy.defaultValue;
  }

  protected get enablePaste(): boolean {
    return terminalEnablePaste.defaultValue;
  }

  protected get copyOnSelection(): boolean {
    return terminalIntegratedCopyOnSelection.defaultValue;
  }

  protected customKeyHandler = (event: KeyboardEvent): boolean => {
    const keycode = KeyCode.createKeyCode(event);
    const keyBindings = keycode.toString();
    const ctrlCmdCopy =
      (isOSX && keyBindings === 'meta+c') || (!isOSX && keyBindings === 'ctrl+c');
    const ctrlCmdPaste =
      (isOSX && keyBindings === 'meta+v') || (!isOSX && keyBindings === 'ctrl+v');

    if (ctrlCmdCopy && this.enableCopy && this.term.hasSelection()) {
      return false;
    }
    if (ctrlCmdPaste && this.enablePaste) {
      return false;
    }
    return true;
  };
  /**
   * Get the cursor style compatible with `xterm`.
   * @returns CursorStyle
   */
  protected getCursorStyle = (): CursorStyle => {
    const value = terminalIntegratedCursorStyle.defaultValue as CursorStyle | 'line';
    return value === 'line' ? 'bar' : value;
  };
  /**
   * Returns given renderer type if it is valid and supported or default renderer otherwise.
   *
   * @param terminalRendererType desired terminal renderer type
   */
  protected getTerminalRendererType = (
    terminalRendererType?: string | TerminalRendererType,
  ): TerminalRendererType => {
    if (terminalRendererType && isTerminalRendererType(terminalRendererType)) {
      return terminalRendererType;
    }
    return DEFAULT_TERMINAL_RENDERER_TYPE;
  };

  override onViewMount(): void {
    this.open();
  }

  override onViewUnmount(): void {
    this.termOpened = false;
  }

  /**
   * Refresh the terminal session.
   *
   * #### Notes
   * Failure to reconnect to the session should be caught appropriately
   */
  public refresh = async (): Promise<void> => {
    if (!this.isDisposed && this._isReady) {
      await this.connection?.reconnect();
      this.term.clear();
    }
  };

  protected resizeTerminal = (): void => {
    this.fitAddon.fit();
  };

  /**
   * Set the size of the terminal in the session.
   */
  protected setSessionSize(): void {
    if (this.container && this.container.current) {
      const content = [
        this.term.rows,
        this.term.cols,
        this.container.current.offsetHeight,
        this.container.current.offsetWidth,
      ];

      if (!this.isDisposed && this.connection) {
        this.connection.send({ type: 'set_size', content });
      }
    }
  }

  override onViewResize = (): void => {
    // todo 这里为什么没有触发isAttached
    // if (!this.isVisible || !this.isAttached) {
    //   return;
    // }

    if (!this.isVisible) {
      return;
    }
    if (this.container?.current) {
      if (this.container.current.offsetHeight === 0) {
        return;
      }
      if (this.container.current.offsetWidth === 0) {
        return;
      }
    }

    // 触发term的resize 事件
    this.processResize();
  };

  protected processResize = () => {
    this.open();
    this.resizeTerminal();
  };

  protected open = (): void => {
    try {
      if (this.termOpened) {
        return;
      }
      const node = this.container?.current;
      if (node) {
        this.term.open(node);
      }
      if (this.initialData) {
        this.term.write(this.initialData);
      }
      this.termOpened = true;
      this.onDidOpenEmitter.fire(true);
      this.initialData = '';

      if (isFirefox) {
        // The software scrollbars don't work with xterm.js, so we disable the scrollbar if we are on firefox.
        if (this.term.element) {
          (this.term.element?.children.item(0) as HTMLElement).style.overflow =
            'hidden';
        }
      }
    } catch (e) {
      this.onDidOpenFailureEmitter.fire(e);
      throw e;
    }
  };

  protected hasWebGLContext(): boolean {
    // Create canvas element. The canvas is not added to the
    // document itself, so it is never displayed in the
    // browser window.
    const canvas = document.createElement('canvas');

    // Get WebGLRenderingContext from canvas element.
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    // Report the result.
    try {
      return gl instanceof WebGLRenderingContext;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create a xterm.js terminal
   */
  protected createTerminal(options: ITerminalOptions): [Terminal, FitAddon] {
    const term = new Terminal(options);
    this.addRenderer(term);
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());
    return [term, fitAddon];
  }

  protected addRenderer(term: Terminal): void {
    const supportWebGL = this.hasWebGLContext();
    const renderer = this.hasWebGLContext() ? new WebglAddon() : new CanvasAddon();
    term.loadAddon(renderer);
    if (supportWebGL) {
      (renderer as WebglAddon).onContextLoss((event) => {
        // console.debug('WebGL context lost - reinitialize Xtermjs renderer.');
        renderer.dispose();
        // If the Webgl context is lost, reinitialize the addon
        this.addRenderer(term);
      });
    }
  }

  public readonly onDidOpenFailure = this.onDidOpenFailureEmitter.event;
  public readonly onSizeChanged = this.onSizeChangedEmitter.event;
  public readonly onData = this.onDataEmitter.event;
  public readonly onKey = this.onKeyEmitter.event;
  public readonly onDidClose = this.onDidCloseEmitter.event;
  public readonly onTitleChange = this.onTitleChangeEmitter.event;
  /**
   * Terminal is ready event
   */
  public get name() {
    return this.connection?.name || '';
  }

  public onReady = this.onReadyEmitter.event;

  /**
   * Check if terminal has any text selected.
   */
  public hasSelection(): boolean {
    if (!this.isDisposed && this._isReady) {
      return this.term.hasSelection();
    }
    return false;
  }

  /**
   * Paste text into terminal.
   */
  public paste(data: string): void {
    if (!this.isDisposed && this._isReady) {
      return this.term.paste(data);
    }
  }

  /**
   * Get selected text from terminal.
   */
  public getSelection(): string | null {
    if (!this.isDisposed && this._isReady) {
      return this.term.getSelection();
    }
    return null;
  }

  public scrollLineUp = (): void => {
    this.term.scrollLines(-1);
  };

  public scrollLineDown = (): void => {
    this.term.scrollLines(1);
  };

  public scrollToTop = (): void => {
    this.term.scrollToTop();
  };

  public scrollToBottom = (): void => {
    this.term.scrollToBottom();
  };

  public scrollPageUp = (): void => {
    this.term.scrollPages(-1);
  };

  public scrollPageDown = (): void => {
    this.term.scrollPages(1);
  };

  public resetTerminal = (): void => {
    this.term.reset();
  };

  public writeLine = (data: string): void => {
    this.term.writeln(data);
  };

  public write = (data: string | Uint8Array): void => {
    this.term.write(data);
  };
}
