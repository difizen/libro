import { DisplayWrapComponent } from '@difizen/libro-common';
import type { BetweenCellProvider, CellOptions, LibroView } from '@difizen/libro-core';
import { CellService } from '@difizen/libro-core';
import { CommandRegistry, useInject, ViewInstance } from '@difizen/mana-app';
import { l10n } from '@difizen/mana-l10n';
import { Tooltip, Popover, Menu } from 'antd';
import type { MenuProps } from 'antd';
import { useEffect, useRef, useState, forwardRef } from 'react';

import { LibroAddBetweenCellCommand } from './add-between-cell-command-contribution.js';

import './index.less';

const AddCellOutlined: React.FC = () => (
  <svg
    width="18px"
    height="18px"
    viewBox="0 0 18 18"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <g id="页面-1" stroke="none" strokeWidth="1" fill="#6982A9" fillRule="evenodd">
      <g id="2.0-添加-cell" transform="translate(-1539.000000, -240.000000)">
        <g id="Icon/01-Line/add备份-3" transform="translate(1539.937500, 240.562500)">
          <path
            d="M15.9375,7.546875 C16.040625,7.546875 16.125,7.63125 16.125,7.734375 L16.125,9.140625 C16.125,9.24375 16.040625,9.328125 15.9375,9.328125 L8.953125,9.328125 L8.953125,16.6875 C8.953125,16.7910534 8.86917839,16.875 8.765625,16.875 L7.359375,16.875 C7.25582161,16.875 7.171875,16.7910534 7.171875,16.6875 L7.171875,9.328125 L0.1875,9.328125 C0.084375,9.328125 0,9.24375 0,9.140625 L0,7.734375 C0,7.63125 0.084375,7.546875 0.1875,7.546875 L7.171875,7.546875 L7.171875,0.1875 C7.171875,0.0839466094 7.25582161,0 7.359375,0 L8.765625,0 C8.86917839,0 8.953125,0.0839466094 8.953125,0.1875 L8.953125,7.546875 L15.9375,7.546875 Z"
            id="path-1"
            fill="currentColor"
          />
        </g>
      </g>
    </g>
  </svg>
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const LibroCommonBetweenCellContent: BetweenCellProvider = forwardRef(
  function LibroCommonBetweenCellContent(
    props: {
      index: number;
      addCell: (option: CellOptions, position?: number | undefined) => Promise<void>;
    },
    ref,
  ) {
    const { addCell, index } = props;
    const { cellsMeta } = useInject<CellService>(CellService);
    const anchorRef = useRef<HTMLDivElement>(null);
    const gutterRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [GutterVisible, setGutterVisible] = useState(false);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const command = useInject(CommandRegistry);

    const innerOpenTooltip = () => {
      if (menuVisible) {
        return;
      }
      setTooltipVisible(true);
    };

    //====== delay ========
    const delayRef = useRef<any>();

    const clearDelay = () => {
      clearTimeout(delayRef.current);
    };

    const openTooltip = (nextOpen: boolean, delay = 0.5) => {
      clearDelay();

      if (delay === 0) {
        innerOpenTooltip();
      } else {
        delayRef.current = setTimeout(() => {
          innerOpenTooltip();
        }, delay * 1000);
      }
    };

    const closeTooltip = () => {
      clearDelay();
      setTooltipVisible(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => closeTooltip, []);

    const items: MenuProps['items'] = cellsMeta
      .filter((item) => item.type !== 'raw')
      .map((item) => {
        return {
          label: item.name,
          key: item.type,
          onClick: async () => {
            command.executeCommand(
              LibroAddBetweenCellCommand.AddBetweenCell.id,
              item.type,
              addCell,
              index,
            );
            anchorRef.current?.blur();
            setMenuVisible(false);
          },
        };
      });

    return (
      <div className="libro-add-between-cell">
        <Popover
          content={<Menu items={items} />}
          trigger="click"
          getPopupContainer={(trigger) => anchorRef.current ?? trigger}
          placement="bottomLeft"
          overlayClassName="libro-add-cell-menu"
          destroyTooltipOnHide
          open={menuVisible}
        >
          <div
            tabIndex={10}
            className="libro-add-between-cell-anchor"
            style={{
              position: 'absolute',
              top: position.top + 5,
              left: position.left + 5,
              width: 1,
              height: 1,
              zIndex: 1000,
            }}
            ref={anchorRef}
            onBlur={(e) => {
              if (!anchorRef.current?.contains(e.relatedTarget)) {
                setMenuVisible(false);
              }
              setGutterVisible(false);
              closeTooltip();
            }}
          />
        </Popover>
        <div
          ref={gutterRef}
          className="libro-add-between-cell-area"
          onMouseEnter={() => {
            setGutterVisible(true);
          }}
          onMouseLeave={() => {
            closeTooltip();
            if (menuVisible) {
              setGutterVisible(true);
              return;
            }

            setGutterVisible(false);
          }}
          onMouseUp={(e) => {
            closeTooltip();
            setGutterVisible(true);
            setMenuVisible(true);

            // TODO: 位置不准确
            setPosition({ top: e.nativeEvent.offsetY, left: e.nativeEvent.offsetX });
            anchorRef.current?.focus();
          }}
        >
          {GutterVisible && (
            <>
              <Tooltip
                title={l10n.t('添加 Cell')}
                open={tooltipVisible}
                overlayClassName="libro-add-between-cell-tooltip"
                destroyTooltipOnHide
              >
                <span
                  className="libro-add-between-cell-icon"
                  onMouseEnter={() => {
                    openTooltip(true);
                  }}
                  onMouseLeave={() => {
                    closeTooltip();
                    if (menuVisible) {
                      setGutterVisible(true);
                    }
                  }}
                >
                  <AddCellOutlined />
                </span>
              </Tooltip>
              <div className="libro-cell-divider" />
            </>
          )}
        </div>
      </div>
    );
  },
);

export const LibroWrappedBetweenCellContent: BetweenCellProvider = (props: {
  index: number;
  addCell: (option: CellOptions, position?: number | undefined) => Promise<void>;
}) => {
  const { index, addCell } = props;
  const instance = useInject<LibroView>(ViewInstance);
  return (
    <DisplayWrapComponent mode={!instance.model.cellsEditable}>
      <LibroCommonBetweenCellContent index={index} addCell={addCell} />
    </DisplayWrapComponent>
  );
};
