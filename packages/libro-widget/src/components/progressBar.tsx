import { Progress } from 'antd';

/**
 * Props for the ProgressBar.
 */
export interface IProgressBarProps {
  /**
   * The current progress percentage, from 0 to 100
   */
  percent: number;
  /**
   * Width of progress bar in pixel.
   */
  width?: number;
}

export function ProgressBar(props: IProgressBarProps) {
  return (
    <>
      <Progress
        strokeLinecap="butt"
        percent={props.percent}
        strokeWidth={18}
        showInfo={false}
        style={{ width: '200px' }}
      />
    </>
  );
}
