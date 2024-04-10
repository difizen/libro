import type { ChatChannel } from './chat-channel.js';

/**
 * Objects that can be chatted with
 * usually from SDK presets or retrieved from the context
 */
export interface IChatObject {
  // name of the object
  name: string;
  // type of the object
  type: string;
  // order of the object
  order: number;
  // key of the object
  key: string;
  // whether the object is disabled
  disabled?: boolean;
}

export type ChatObjectOptions = Partial<IChatObject>;
export const ChatObjectOptions = Symbol('ChatObjectOptions');
export type ChatObjectFactory = (obj: ChatObjectOptions) => IChatObject;
export const ChatObjectFactory = Symbol('ChatObjectFactory');

/**
 * Messages that can be sent and received
 */
export interface IChatMessage {
  // type of the message
  type: string;
  // identity of the sender
  from: string;
  // role of the sender
  role?: string;
  // timestamp of the message
  at: string;
  // message content
  message: string;
}

export type ChatMessageFactory = (obj: ChatMessageOptions) => IChatMessage;
export const ChatMessageFactory = Symbol('ChatMessageFactory');
export type ChatMessageOptions = Partial<IChatMessage>;
export const ChatMessageOptions = Symbol('ChatMessageOptions');

/**
 * Records that store messages and members
 */
export interface IChatRecord {
  // name of the record
  name?: string;
  // messages in the record
  messages: IChatMessage[];
  // members in the record
  members: string[];
}
export type ChatRecordOptions = Partial<IChatRecord>;
export const ChatRecordOptions = Symbol('ChatRecordOptions');
export type ChatRecordFactory = (obj: ChatRecordOptions) => IChatRecord;
export const ChatRecordFactory = Symbol('ChatRecordFactory');

/**
 * Channels that store records and members
 */
export type IChatChannel = ChatChannel;
export type ChatChannelFactory = () => IChatChannel;
export const ChatChannelFactory = Symbol('ChatChannelFactory');
