import { Syringe } from '@difizen/mana-syringe';

export interface ModalItemProps<T> {
  modalItem: ModalItem<T>;
  data?: T;
  visible: boolean;
  close: () => void;
}

export interface ModalItem<T = any> {
  id: string;
  component: React.FC<ModalItemProps<T>>;
  shouldRender?: (data?: T) => boolean;
  render?: (props: ModalItemProps<T>) => React.ReactNode;
  __data?: T;
}

export const ModalContribution = Syringe.defineToken('ModalContribution');
export interface ModalContribution {
  registerModal?: () => ModalItem<any>;
  registerModals?: () => ModalItem<any>[];
}

export function renderModal<T>(
  componet: React.FC<ModalItemProps<T>>,
  props: ModalItemProps<any>,
): React.ReactNode {
  const Modal = componet;
  return <Modal key={props.modalItem.id} {...props} />;
}
