import { LoadingOutlined } from '@ant-design/icons';
import type { CellView } from '@difizen/libro-core';
import {
  ExecutableCellView,
  CheckCircleOutlined,
  ExecutableCellModel,
} from '@difizen/libro-core';
import { useObserve } from '@difizen/mana-app';
import classnames from 'classnames';
import moment from 'moment';

import type { JupyterCodeCellModel } from '../cell/jupyter-code-cell-model.js';
import {
  formatTime,
  parseExecutionInfoFromModel,
  isWaitingExecute,
} from '../utils/index.js';

import { InfoCircle } from './icons.js';

import './index.less';

export function CellExecutionTip({ cell }: { cell: CellView }) {
  const observableCell = useObserve(cell);

  if (!ExecutableCellView.is(cell)) {
    return null;
  }

  if (!ExecutableCellModel.is(observableCell.model)) {
    return null;
  }

  const isHidden = observableCell.model.hasOutputHidden;
  const kernelExecuting = (cell.model as JupyterCodeCellModel).kernelExecuting;
  const executionInfo = parseExecutionInfoFromModel(cell.model);

  const output = cell.outputArea.outputs;
  const existOutput = output && output.length !== 0;

  const waitingExecute = isWaitingExecute(observableCell.model);

  if (!executionInfo) {
    return null;
  }

  const { executeStartTime, executeFinishTime } = executionInfo;
  if (executeStartTime && executeFinishTime && observableCell.model.executeCount) {
    return isHidden ? (
      <div className="libro-cell-execution-tip-hide-output">
        <div className="libro-cell-execution-tip-border" />
        <CheckCircleOutlined />
      </div>
    ) : (
      <div
        className={classnames(
          `libro-cell-execution-tip`,
          !existOutput && 'libro-cell-execution-tip-without-output',
        )}
      >
        <div className="libro-cell-execution-tip-border" />
        <CheckCircleOutlined />
        <p>
          {'The execution took in ' +
            formatTime(
              Number(new Date(executeFinishTime).getTime()) -
                Number(new Date(executeStartTime).getTime()),
            ) +
            ', finished at ' +
            moment(new Date(executeFinishTime).getTime()).format('hh:mm a') +
            '.'}
        </p>
      </div>
    );
  } else if (kernelExecuting) {
    return (
      <div
        className={classnames(
          `libro-cell-execution-tip`,
          !existOutput && 'libro-cell-execution-tip-without-output',
        )}
      >
        <div className="libro-cell-execution-tip-border" />
        <LoadingOutlined style={{ color: 'rgba(24,144,255,1)' }} />
        <p>
          {'It takes ' +
            formatTime(Date.now() - Number(new Date(executeStartTime).getTime())) +
            '.'}
        </p>
      </div>
    );
  } else if (waitingExecute) {
    return (
      <div
        className={classnames(
          `libro-cell-execution-tip`,
          !existOutput && 'libro-cell-execution-tip-without-output',
        )}
      >
        <div className="libro-cell-execution-tip-border" />
        <InfoCircle />
        <p>{'execution queued.'}</p>
      </div>
    );
  }
  return null;
}
