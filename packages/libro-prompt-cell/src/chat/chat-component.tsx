import { forwardRef } from 'react';

interface ChatComponentProps {
  className?: string;
}
export const ChatComponent = forwardRef<HTMLDivElement>(function ChatComponent(
  props: ChatComponentProps,
  ref,
) {
  return <div ref={ref}>ChatComponent</div>;
});
