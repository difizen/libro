export type ITask<T> = () => T;

// 请求队列，严格保证请求的先后顺序
export class Sequencer {
  private current: Promise<any> = Promise.resolve(null);

  queue<T>(promiseTask: ITask<Promise<T>>): Promise<T> {
    return (this.current = this.current.then(() => promiseTask()));
  }
}
