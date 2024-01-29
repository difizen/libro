export interface ChatObject {
  name: string;
  type: string;
  order: number;
  key: string;
  disabled?: boolean;
}

export function ChatObjectFromKey(
  key: string,
  defaultOptions: Partial<ChatObject> = {},
): ChatObject {
  const [type, name] = key.split(':');
  return {
    name,
    type,
    key,
    order: 0,
    disabled: true,
    ...defaultOptions,
  };
}
