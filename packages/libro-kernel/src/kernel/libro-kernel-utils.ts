import type {
  IClearOutputMsg,
  ICommCloseMsg,
  ICommMsgMsg,
  ICommOpenMsg,
  IDebugEventMsg,
  IDebugReplyMsg,
  IDebugRequestMsg,
  IDisplayDataMsg,
  IErrorMsg,
  IExecuteInputMsg,
  IExecuteReplyMsg,
  IExecuteResultMsg,
  IInfoRequestMsg,
  IInputReplyMsg,
  IInputRequestMsg,
  IMessage,
  IStatusMsg,
  IStreamMsg,
  IUpdateDisplayDataMsg,
} from './messages.js';

/**
 * Test whether a kernel message is a `'stream'` message.
 */
export function isStreamMsg(msg: IMessage): msg is IStreamMsg {
  return msg.header.msg_type === 'stream';
}
/**
 * Test whether a kernel message is an `'display_data'` message.
 */
export function isDisplayDataMsg(msg: IMessage): msg is IDisplayDataMsg {
  return msg.header.msg_type === 'display_data';
}
/**
 * Test whether a kernel message is an `'update_display_data'` message.
 */
export function isUpdateDisplayDataMsg(msg: IMessage): msg is IUpdateDisplayDataMsg {
  return msg.header.msg_type === 'update_display_data';
}
/**
 * Test whether a kernel message is an `'execute_input'` message.
 */
export function isExecuteInputMsg(msg: IMessage): msg is IExecuteInputMsg {
  return msg.header.msg_type === 'execute_input';
}
/**
 * Test whether a kernel message is an `'execute_result'` message.
 */
export function isExecuteResultMsg(msg: IMessage): msg is IExecuteResultMsg {
  return msg.header.msg_type === 'execute_result';
}
/**
 * Test whether a kernel message is an `'error'` message.
 */
export function isErrorMsg(msg: IMessage): msg is IErrorMsg {
  return msg.header.msg_type === 'error';
}
/**
 * Test whether a kernel message is a `'status'` message.
 */
export function isStatusMsg(msg: IMessage): msg is IStatusMsg {
  return msg.header.msg_type === 'status';
}
/**
 * Test whether a kernel message is a `'clear_output'` message.
 */
export function isClearOutputMsg(msg: IMessage): msg is IClearOutputMsg {
  return msg.header.msg_type === 'clear_output';
}
/**
 * Test whether a kernel message is an experimental `'debug_event'` message.
 *
 * @hidden
 *
 * #### Notes
 * Debug messages are experimental messages that are not in the official
 * kernel message specification. As such, this is *NOT* considered
 * part of the public API, and may change without notice.
 */

export function isDebugEventMsg(msg: IMessage): msg is IDebugEventMsg {
  return msg.header.msg_type === 'debug_event';
}
/**
 * Test whether a kernel message is a `'comm_open'` message.
 */
export function isCommOpenMsg(msg: IMessage): msg is ICommOpenMsg {
  return msg.header.msg_type === 'comm_open';
}
/**
 * Test whether a kernel message is a `'comm_close'` message.
 */
export function isCommCloseMsg(msg: IMessage): msg is ICommCloseMsg<'iopub' | 'shell'> {
  return msg.header.msg_type === 'comm_close';
}
/**
 * Test whether a kernel message is a `'comm_msg'` message.
 */
export function isCommMsgMsg(msg: IMessage): msg is ICommMsgMsg {
  return msg.header.msg_type === 'comm_msg';
}
/**
 * Test whether a kernel message is a `'kernel_info_request'` message.
 */
export function isInfoRequestMsg(msg: IMessage): msg is IInfoRequestMsg {
  return msg.header.msg_type === 'kernel_info_request';
}
/**
 * Test whether a kernel message is an `'execute_reply'` message.
 */
export function isExecuteReplyMsg(msg: IMessage): msg is IExecuteReplyMsg {
  return msg.header.msg_type === 'execute_reply';
}
/**
 * Test whether a kernel message is an experimental `'debug_request'` message.
 *
 * @hidden
 *
 * #### Notes
 * Debug messages are experimental messages that are not in the official
 * kernel message specification. As such, this is *NOT* considered
 * part of the public API, and may change without notice.
 */
export function isDebugRequestMsg(msg: IMessage): msg is IDebugRequestMsg {
  return msg.header.msg_type === 'debug_request';
}
/**
 * Test whether a kernel message is an experimental `'debug_reply'` message.
 *
 * @hidden
 *
 * #### Notes
 * Debug messages are experimental messages that are not in the official
 * kernel message specification. As such, this is *NOT* considered
 * part of the public API, and may change without notice.
 */
export function isDebugReplyMsg(msg: IMessage): msg is IDebugReplyMsg {
  return msg.header.msg_type === 'debug_reply';
}
/**
 * Test whether a kernel message is an `'input_request'` message.
 */
export function isInputRequestMsg(msg: IMessage): msg is IInputRequestMsg {
  return msg.header.msg_type === 'input_request';
}
/**
 * Test whether a kernel message is an `'input_reply'` message.
 */
export function isInputReplyMsg(msg: IMessage): msg is IInputReplyMsg {
  return msg.header.msg_type === 'input_reply';
}
