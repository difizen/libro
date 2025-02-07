import type { Disposable } from '@difizen/mana-common';
import { prop } from '@difizen/mana-observable';
import type { Contribution } from '@difizen/mana-syringe';
import { contrib, singleton } from '@difizen/mana-syringe';

import type { ModalItem, ModalItemProps } from './modal-protocol';
import { renderModal, ModalContribution } from './modal-protocol';

export class ModalItemView<T = any> implements Disposable {
  @prop()
  modalItem: ModalItem<T>;

  @prop()
  modalVisible = false;

  @prop()
  modalData?: T;

  constructor(modalItem: ModalItem<T>) {
    this.modalItem = modalItem;
  }

  open = (data: T) => {
    this.modalData = data;
    this.modalVisible = true;
  };

  close = () => {
    this.modalVisible = false;
    this.modalData = undefined;
  };

  shouldRender() {
    if (this.modalVisible !== true || this.disposed) {
      return false;
    }
    if (!this.modalItem.component) {
      console.warn(`${this.modalItem.id} is not valid modal`);
      return false;
    }
    if (this.modalItem.shouldRender) {
      return this.modalItem.shouldRender(this.modalData);
    }
    return true;
  }

  getModalProps(): ModalItemProps<T> {
    const props: ModalItemProps<T> = {
      modalItem: this.modalItem,
      data: this.modalData,
      visible: this.modalVisible,
      close: this.close,
    };
    return props;
  }

  disposed = false;
  dispose() {
    this.disposed = true;
    this.close();
  }
}

@singleton()
export class ModalService {
  protected modals = new Map<string, ModalItem>();

  @prop()
  modalViewList: ModalItemView<any>[] = [];

  protected readonly contributions: Contribution.Provider<ModalContribution>;

  constructor(
    @contrib(ModalContribution) contributions: Contribution.Provider<ModalContribution>,
  ) {
    this.contributions = contributions;
  }

  init() {
    this.contributions.getContributions().forEach((contribution) => {
      if (contribution.registerModal) {
        const modalItem = contribution.registerModal();
        this.registerModal(modalItem);
      }
      if (contribution.registerModals) {
        const modalItems = contribution.registerModals();
        this.registerModals(modalItems);
      }
    });
  }

  hasModal(modal: ModalItem<any> | string): boolean {
    const modalId = typeof modal === 'string' ? modal : modal.id;
    return this.modals.has(modalId);
  }

  getModal<T>(modal: ModalItem<T> | string) {
    const modalId = typeof modal === 'string' ? modal : modal.id;
    return this.modals.get(modalId);
  }

  registerModal(modal: ModalItem) {
    this.modals.set(modal.id, modal);
  }

  registerModals(modals: ModalItem<any>[]) {
    modals.forEach((item) => {
      this.registerModal(item);
    });
  }

  unregisterModal(modal: ModalItem) {
    this.modals.delete(modal.id);
  }

  getOrCreateModalView<T>(modal: ModalItem<T>) {
    let viewInstance = this.modalViewList.find(
      (item) => item.modalItem.id === modal.id,
    );
    if (!viewInstance) {
      const modalItem = this.getModal(modal);
      if (!modalItem) {
        throw Error(`should have modal ${modal.id} registed`);
      }
      viewInstance = new ModalItemView(modalItem);
      this.modalViewList.push(viewInstance);
    }
    return viewInstance;
  }

  openModal = <T>(modal: { id: string } | string, data?: T) => {
    const modalId = typeof modal === 'string' ? modal : modal.id;
    const exist = this.getModal(modalId);
    if (exist) {
      const modalView = this.getOrCreateModalView(exist);
      modalView.open(data);
    }
  };

  closeModal = (modal: { id: string } | string) => {
    const modalId = typeof modal === 'string' ? modal : modal.id;
    this.modalViewList.find((item) => item.modalItem.id === modalId)?.close();
  };

  closeAllModal = () => {
    this.modalViewList.forEach((item) => item.close());
  };

  getModalProps = <T>(itemView: ModalItemView<T>): ModalItemProps<T> => {
    return itemView.getModalProps();
  };

  shouldRenderModal = <T>(itemView: ModalItemView<T>): boolean => {
    return itemView.shouldRender();
  };

  renderModal<T>(itemView: ModalItemView<T>): React.ReactNode {
    if (!this.shouldRenderModal(itemView)) {
      return null;
    }
    if (itemView.modalItem.render) {
      return itemView.modalItem.render(this.getModalProps(itemView));
    }
    return renderModal(itemView.modalItem.component, this.getModalProps(itemView));
  }
}
