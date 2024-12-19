import { CloseOutlined } from '@ant-design/icons';
import './index.css';
import type { WidgetActionItem } from '@difizen/libro-code-editor';
import { Divider } from 'antd';

interface IProps {
  operationList: WidgetActionItem[];
  onActionClick: (actionId: string) => void;
  onClose?: () => void;
}

export const AIWidgetComponent = (props: IProps) => {
  const { onClose, operationList, onActionClick } = props;

  return (
    <div className="imageWrapper">
      <img src={require('../../assets/widget.png')} className="imageDisplay" />
      <Divider type="vertical" />
      {operationList.map((item) => (
        <span
          key={item.id}
          className="textDescription"
          onClick={() => onActionClick(item.id)}
        >
          {item.name}
        </span>
      ))}
      <Divider type="vertical" />
      <CloseOutlined className="closeButton" onClick={onClose} />
    </div>
  );
};
