import type { CellView } from '@difizen/libro-jupyter';
import { Modal } from 'antd';
import { useEffect, useState } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

export function stringToReadableStream(inputString: string) {
  // Convert the string into a Uint8Array
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(inputString);

  // Create a new ReadableStream
  const readableStream = new ReadableStream({
    start(controller) {
      // Enqueue the Uint8Array into the stream
      controller.enqueue(uint8Array);
      // Close the stream
      controller.close();
    },
  });

  return readableStream;
}

export function addCellAIClassname(cell: CellView) {
  if (cell.className?.includes('ai-cell-focus')) {
    return;
  } else {
    cell.className = cell.className + ' ai-cell-focus';
  }
}

export function cancelCellAIClassname(cell: CellView) {
  if (cell.className?.includes(' ai-cell-focus')) {
    cell.className = cell.className?.replace(' ai-cell-focus', '');
  }
}

export function ImageModal({ src, alt }: any) {
  const [visible, setVisible] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageDimensions({
        width: img.width,
        height: img.height,
      });
    };
  }, [src]);

  const maxModalWidth = window.innerWidth * 0.8; // 80% of the viewport width
  const maxModalHeight = window.innerHeight * 0.8; // 80% of the viewport height

  let adjustedWidth, adjustedHeight;

  const aspectRatio = imageDimensions.width / imageDimensions.height;

  if (imageDimensions.width > maxModalWidth) {
    adjustedWidth = maxModalWidth;
    adjustedHeight = adjustedWidth / aspectRatio;
  } else if (imageDimensions.height > maxModalHeight) {
    adjustedHeight = maxModalHeight;
    adjustedWidth = adjustedHeight * aspectRatio;
  } else {
    adjustedWidth = imageDimensions.width;
    adjustedHeight = imageDimensions.height;
  }

  return (
    <div>
      <img
        src={src}
        alt={alt}
        style={{ cursor: 'pointer' }}
        onClick={() => setVisible(true)}
        onLoad={() => {
          // 解决生成图片没有滚动到最下方的问题。
          document.getElementById('chat-main-scroll')?.scrollIntoView(false);
        }}
      />
      <Modal
        open={visible}
        closeIcon={false}
        footer={null}
        width={adjustedWidth + 30}
        onCancel={() => setVisible(false)}
        bodyStyle={{
          padding: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: adjustedHeight,
        }}
      >
        <TransformWrapper initialScale={1} initialPositionX={0} initialPositionY={0}>
          <TransformComponent>
            <img
              src={src}
              alt={alt}
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          </TransformComponent>
        </TransformWrapper>
      </Modal>
    </div>
  );
}
