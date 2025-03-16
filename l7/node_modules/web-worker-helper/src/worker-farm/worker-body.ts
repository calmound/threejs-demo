import type { WorkerMessageData, WorkerMessageType, WorkerMessagePayload } from '../types';
import { getTransferList } from '../utils/worker-utils/get-transfer-list';

const onMessageWrapperMap = new Map();

/**
 * Type safe wrapper for worker code
 */
export default class WorkerBody {
  /*
   * (type: WorkerMessageType, payload: WorkerMessagePayload) => any
   */
  static set onmessage(onMessage: (type: WorkerMessageType, payload: WorkerMessagePayload) => any) {
    self.onmessage = (message: MessageEvent<any>) => {
      if (!isKnownMessage(message)) {
        return;
      }

      // Confusingly the message itself also has a 'type' field which is always set to 'message'
      const { type, payload } = message.data;
      onMessage(type, payload);
    };
  }

  static addEventListener(onMessage: (type: WorkerMessageType, payload: WorkerMessagePayload) => any) {
    let onMessageWrapper = onMessageWrapperMap.get(onMessage);

    if (!onMessageWrapper) {
      onMessageWrapper = (message: MessageEvent<any>) => {
        if (!isKnownMessage(message)) {
          return;
        }

        // Confusingly the message itself also has a 'type' field which is always set to 'message'
        const { type, payload } = message.data;
        onMessage(type, payload);
      };
    }

    self.addEventListener('message', onMessageWrapper);
  }

  static removeEventListener(onMessage: (type: WorkerMessageType, payload: WorkerMessagePayload) => any) {
    const onMessageWrapper = onMessageWrapperMap.get(onMessage);
    onMessageWrapperMap.delete(onMessage);
    self.removeEventListener('message', onMessageWrapper);
  }

  /**
   * Send a message from a worker to creating thread (main thread)
   * 从 worker 线程发送消息到主线程
   * @param type
   * @param payload
   */
  static postMessage(type: WorkerMessageType, payload: WorkerMessagePayload): void {
    if (self) {
      const data: WorkerMessageData = { source: 'Worker thread', type, payload };
      const transferList = getTransferList(payload);
      // TODO: targetOrigin, transferList
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      self.postMessage(data, transferList);
    }
  }
}

// Filter out noise messages sent to workers
function isKnownMessage(message: MessageEvent<any>) {
  const { type, data } = message;
  return type === 'message' && data && typeof data.source === 'string' && data.source === 'Main thread';
}
