import { CodeOutlined } from '@ant-design/icons';
import { isFirefox } from '@difizen/mana-app';
import {
  BaseView,
  view,
  transient,
  inject,
  Disposable,
  KeyCode,
  isOSX,
  DisposableCollection,
  Emitter,
} from '@difizen/mana-app';
import { forwardRef } from 'react';
import type { RendererType } from 'xterm';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

import type { CursorStyle, TerminalRendererType } from './configuration.js';
import {
  DEFAULT_TERMINAL_RENDERER_TYPE,
  isTerminalRendererType,
} from './configuration.js';
import { TerminalConfiguration } from './configuration.js';
import type { TerminalConnection } from './connection.js';
import { TerminalManager } from './manager.js';
import type { TerminalMessage } from './protocol.js';
import { TerminalViewOption } from './protocol.js';
import { TerminalThemeService } from './theme-service.js';

export const TerminalComponent = forwardRef<HTMLDivElement>(function TerminalComponent(
  _props: { top?: number },
  ref,
) {
  // const instance = useInject<LibroTerminalView>(ViewInstance);
  return (
    <div tabIndex={1} className="libro-terminal" ref={ref}>
      /
    </div>
  );
});

@transient()
@view('libro-terminal-view')
export class LibroTerminalView extends BaseView {
  protected term: Terminal;
  override view = TerminalComponent;
  protected options: TerminalViewOption;
  protected termOpened = false;
  protected initialData = '';
  protected fitAddon: FitAddon;
  @inject(TerminalConfiguration)
  protected readonly config: TerminalConfiguration;
  @inject(TerminalThemeService)
  protected readonly themeService: TerminalThemeService;
  @inject(TerminalManager)
  protected readonly terminalManager: TerminalManager;

  protected readonly toDisposeOnConnect = new DisposableCollection();

  protected readonly onDidOpenEmitter = new Emitter<void>();
  readonly onDidOpen = this.onDidOpenEmitter.event;

  protected readonly onDidOpenFailureEmitter = new Emitter<void>();
  readonly onDidOpenFailure = this.onDidOpenFailureEmitter.event;

  protected readonly onSizeChangedEmitter = new Emitter<{
    cols: number;
    rows: number;
  }>();
  readonly onSizeChanged = this.onSizeChangedEmitter.event;

  protected readonly onDataEmitter = new Emitter<string>();
  readonly onData = this.onDataEmitter.event;

  protected readonly onKeyEmitter = new Emitter<{
    key: string;
    domEvent: KeyboardEvent;
  }>();
  readonly onKey = this.onKeyEmitter.event;
  protected readonly onDidCloseEmitter = new Emitter<LibroTerminalView>();
  readonly onDidClose = this.onDidCloseEmitter.event;

  protected connection?: TerminalConnection;

  constructor(@inject(TerminalViewOption) options: TerminalViewOption) {
    super();
    this.options = options;
    this.title.icon = CodeOutlined;
    this.createTerm();
    this.createConnection();
    if (this.options.destroyOnClose === true) {
      this.toDispose.push(Disposable.create(() => this.term.dispose()));
    }
    this.toDispose.push(
      this.themeService.onDidChange(() =>
        this.term.setOption('theme', this.themeService.theme),
      ),
    );
    this.toDispose.push(
      this.term.onTitleChange((title: string) => {
        if (this.options.useServerTitle) {
          this.title.label = title;
        }
      }),
    );
    this.toDispose.push(this.onDidCloseEmitter);
    this.toDispose.push(this.onDidOpenEmitter);
    this.toDispose.push(this.onDidOpenFailureEmitter);
    this.toDispose.push(this.onSizeChangedEmitter);
    this.toDispose.push(this.onDataEmitter);
    this.toDispose.push(this.onKeyEmitter);

    this.toDispose.push(
      this.term.onResize((data) => {
        this.onSizeChangedEmitter.fire(data);
      }),
    );

    this.toDispose.push(
      this.term.onData((data) => {
        this.onDataEmitter.fire(data);
      }),
    );

    this.toDispose.push(
      this.term.onBinary((data) => {
        this.onDataEmitter.fire(data);
      }),
    );

    this.toDispose.push(
      this.term.onKey((data) => {
        this.onKeyEmitter.fire(data);
      }),
    );
  }
  protected createConnection = async () => {
    const connection = await this.terminalManager.getOrCreate(this.options);
    this.connection = connection;
    connection.messageReceived(this.onMessage);
    if (this.isDisposed) {
      return;
    }
    this.initialConnection();
    this.toDispose.push(connection.connectionStatusChanged(this.initialConnection));
  };

  /**
   * Handle a message from the terminal session.
   */
  protected onMessage(msg: TerminalMessage): void {
    switch (msg.type) {
      case 'stdout':
        if (msg.content) {
          this.term.write(msg.content[0] as string);
        }
        break;
      case 'disconnect':
        this.term.write('\r\n\r\n[Finished… Term Session]\r\n');
        break;
      default:
        break;
    }
  }

  protected initialConnection() {
    if (this.isDisposed) {
      return;
    }
    if (this.connection?.connectionStatus !== 'connected') {
      return;
    }
    this.title.label = `Terminal ${this.connection.name}`;
    if (this.connection && this.options.initialCommand) {
      this.connection?.send({
        type: 'stdin',
        content: [this.options.initialCommand + '\r'],
      });
    }
  }

  protected createTerm = () => {
    const term = new Terminal({
      cursorBlink: this.config.get('terminal.integrated.cursorBlinking'),
      cursorStyle: this.getCursorStyle(),
      cursorWidth: this.config.get('terminal.integrated.cursorWidth'),
      fontFamily: this.config.get('terminal.integrated.fontFamily'),
      fontSize: this.config.get('terminal.integrated.fontSize'),
      fontWeight: this.config.get('terminal.integrated.fontWeight'),
      fontWeightBold: this.config.get('terminal.integrated.fontWeightBold'),
      drawBoldTextInBrightColors: this.config.get(
        'terminal.integrated.drawBoldTextInBrightColors',
      ),
      letterSpacing: this.config.get('terminal.integrated.letterSpacing'),
      lineHeight: this.config.get('terminal.integrated.lineHeight'),
      scrollback: this.config.get('terminal.integrated.scrollback'),
      fastScrollSensitivity: this.config.get(
        'terminal.integrated.fastScrollSensitivity',
      ),
      rendererType: this.getTerminalRendererType(
        this.config.get('terminal.integrated.rendererType'),
      ),
      theme: this.themeService.theme,
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    this.fitAddon = fitAddon;
    this.term = term;
    this.term.attachCustomKeyEventHandler((e) => this.customKeyHandler(e));
  };
  protected get enableCopy(): boolean {
    return this.config.get('terminal.enableCopy');
  }

  protected get enablePaste(): boolean {
    return this.config.get('terminal.enablePaste');
  }
  protected get copyOnSelection(): boolean {
    return this.config.get('terminal.integrated.copyOnSelection');
  }

  protected customKeyHandler = (event: KeyboardEvent): boolean => {
    const keyBindings = KeyCode.createKeyCode(event).toString();
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
    const value = this.config.get('terminal.integrated.cursorStyle');
    return value === 'line' ? 'bar' : value;
  };
  /**
   * Returns given renderer type if it is valid and supported or default renderer otherwise.
   *
   * @param terminalRendererType desired terminal renderer type
   */
  protected getTerminalRendererType = (
    terminalRendererType?: string | TerminalRendererType,
  ): RendererType => {
    if (terminalRendererType && isTerminalRendererType(terminalRendererType)) {
      return terminalRendererType;
    }
    return DEFAULT_TERMINAL_RENDERER_TYPE;
  };

  protected resizeTerminal = (): void => {
    const geo = this.fitAddon.proposeDimensions();
    const cols = geo.cols;
    const rows = geo.rows - 1; // subtract one row for margin
    this.term.resize(cols, rows);
  };

  override onViewResize = (): void => {
    if (!this.isVisible || !this.isAttached) {
      return;
    }
    this.open();
    this.resizeTerminal();
  };

  protected open = (): void => {
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
    this.initialData = '';

    if (isFirefox) {
      // The software scrollbars don't work with xterm.js, so we disable the scrollbar if we are on firefox.
      if (this.term.element) {
        (this.term.element?.children.item(0) as HTMLElement).style.overflow = 'hidden';
      }
    }
  };

  scrollLineUp = (): void => {
    this.term.scrollLines(-1);
  };

  scrollLineDown = (): void => {
    this.term.scrollLines(1);
  };

  scrollToTop = (): void => {
    this.term.scrollToTop();
  };

  scrollToBottom = (): void => {
    this.term.scrollToBottom();
  };

  scrollPageUp = (): void => {
    this.term.scrollPages(-1);
  };

  scrollPageDown = (): void => {
    this.term.scrollPages(1);
  };

  resetTerminal = (): void => {
    this.term.reset();
  };

  writeLine = (text: string): void => {
    this.term.writeln(text);
  };
}
