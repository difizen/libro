import { ViewInstance } from '../../mana-core/index.js';
import { useInject } from '../../observable/index.js';
import type { TreeNodeProps } from '../tree/tree';

import type { FileTreeView } from './file-tree-view';

export function TreeNodeIcon(props: TreeNodeProps) {
  const fileTree = useInject<FileTreeView>(ViewInstance);
  const { node } = props;
  const icon = fileTree.toNodeIcon(node);
  if (icon) {
    return <div className={`${icon} file-icon`} />;
  }
  return null;
}
