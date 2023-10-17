import type * as nbformat from '@difizen/libro-common';
import type {
  LibroExecutableCellView,
  ExecutableCellModel,
  IOutputAreaOption,
} from '@difizen/libro-core';
import { LibroOutputArea } from '@difizen/libro-core';
import {
  isDisplayDataMsg,
  isStreamMsg,
  isErrorMsg,
  isExecuteResultMsg,
  isExecuteReplyMsg,
} from '@difizen/libro-kernel';
import { view, inject, transient, ViewOption } from '@difizen/mana-app';

@transient()
@view('libro-output-area')
export class LibroJupyterOutputArea extends LibroOutputArea {
  declare cell: LibroExecutableCellView;

  constructor(@inject(ViewOption) option: IOutputAreaOption) {
    super(option);
    this.handleMsg();
  }

  handleMsg() {
    const cellModel = this.cell.model as ExecutableCellModel;
    cellModel.msgChangeEmitter.event((msg) => {
      if (msg.header.msg_type !== 'status') {
        if (msg.header.msg_type === 'execute_input') {
          cellModel.executeCount = msg.content.execution_count;
        }
        if (
          isDisplayDataMsg(msg) ||
          isStreamMsg(msg) ||
          isErrorMsg(msg) ||
          isExecuteResultMsg(msg)
        ) {
          const output: nbformat.IOutput = {
            ...msg.content,
            output_type: msg.header.msg_type,
          };
          this.add(output);
        }
        //Handle an execute reply message.
        if (isExecuteReplyMsg(msg)) {
          const content = msg.content;
          if (content.status !== 'ok') {
            return;
          }
          const payload = content && content.payload;
          if (!payload || !payload.length) {
            return;
          }
          const pages = payload.filter((i: any) => i.source === 'page');
          if (!pages.length) {
            return;
          }
          const page = JSON.parse(JSON.stringify(pages[0]));
          const output: nbformat.IOutput = {
            output_type: 'display_data',
            data: page.data as nbformat.IMimeBundle,
            metadata: {},
          };
          this.add(output);
        }
      }
    });
  }
}
