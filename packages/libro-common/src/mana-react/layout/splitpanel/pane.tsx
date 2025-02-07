export interface PaneProps {
  id: string;
  className?: string;
  minSize?: number;
  maxSize?: number;
  minResize?: number;
  flex?: number;
  overflow?: string;
  flexGrow?: number;
  slot?: string;
  noResize?: boolean;
  savedSize?: number;
  defaultSize?: number;
  children?: React.ReactNode | React.ReactNode[];
}

export const Pane: React.FC<PaneProps> = ({ children }: PaneProps) => {
  return <>{children}</>;
};
