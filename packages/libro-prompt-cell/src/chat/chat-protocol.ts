/**
 * Objects that can be chatted with
 * usually from SDK presets or retrieved from the context
 */
export interface ChatObject {
  name: string;
  type: string;
  order: number;
  key: string;
  disabled?: boolean;
}

export function ChatObjectFromKey(
  key: string,
  options: Partial<ChatObject> = {},
): ChatObject {
  const [type, name] = key.split(':');
  return {
    name,
    type,
    key,
    order: 0,
    disabled: true,
    ...options,
  };
}
