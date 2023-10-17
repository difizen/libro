import { Progress } from 'antd';
/**
 * Props for the ProgressBar.
 */
export interface IProgressCircleProps {
  /**
   * The current progress percentage, from 0 to 100
   */
  percent: number;
}

export function ProgressCircle(props: IProgressCircleProps) {
  return (
    <>
      <Progress strokeLinecap="butt" type="circle" percent={props.percent} />;
    </>
  );
}
