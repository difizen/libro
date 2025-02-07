import classNames from 'classnames';
import RcDropdown from 'rc-dropdown';
import type { DropdownProps as RcDropdownProps } from 'rc-dropdown/lib/Dropdown';
import React from 'react';
import { forwardRef } from 'react';
import './styles/index.less';

export type Trigger = 'click' | 'hover' | 'contextMenu';
export type Placement =
  | 'topLeft'
  | 'topCenter'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomCenter'
  | 'bottomRight';

export interface DropdownProps extends RcDropdownProps {
  prefixCls?: string;
  className?: string;
  overlayStyle?: React.CSSProperties;
  overlayClassName?: string;
  visible?: boolean;
  disabled?: boolean;
  trigger?: Trigger | Trigger[];
  transitionName?: string;
  placement?: Placement;
  forceRender?: boolean;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  onVisibleChange?: (visible?: boolean) => void;
  getPopupContainer?: (triggerNode: Element) => HTMLElement;
}

const defaultProps: Partial<DropdownProps> = {
  trigger: 'hover',
  prefixCls: 'mana',
  mouseEnterDelay: 0.15,
  mouseLeaveDelay: 0.1,
  placement: 'bottomLeft',
};

export const Dropdown = forwardRef(function Dropdown(props: DropdownProps, ref) {
  const {
    children,
    trigger = defaultProps.trigger,
    prefixCls = defaultProps.prefixCls,
    disabled,
    overlay,
  } = props;

  const dropdownPrefixCls = `${prefixCls}-dropdown`;
  const child = React.Children.only(children) as React.ReactElement<any>;
  const dropdownTrigger = React.cloneElement(child, {
    className: classNames(
      (children as any).props.className,
      `${dropdownPrefixCls}-trigger`,
    ),
    disabled,
  });

  const currentTriggers = Array.isArray(trigger) ? trigger : [trigger];
  const triggers = disabled ? [] : currentTriggers;

  let alignPoint = false;
  if (triggers && triggers.indexOf('contextMenu') !== -1) {
    alignPoint = true;
  }

  const dropdownOverlay = React.Children.only(overlay) as any;
  const fixedOverlay = (
    <div className={classNames(`${dropdownPrefixCls}-overlay`)}>{dropdownOverlay}</div>
  );

  return (
    <RcDropdown
      {...props}
      prefixCls={dropdownPrefixCls}
      overlay={fixedOverlay}
      alignPoint={alignPoint}
      trigger={triggers as string[]}
      ref={ref}
    >
      {dropdownTrigger}
    </RcDropdown>
  );
});
