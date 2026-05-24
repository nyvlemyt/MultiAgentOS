import { EventEmitter } from 'node:events';

export interface WorkerEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

class Bus extends EventEmitter {
  publish(evt: WorkerEvent) {
    this.emit('event', evt);
  }

  subscribe(cb: (evt: WorkerEvent) => void) {
    this.on('event', cb);
    return () => this.off('event', cb);
  }
}

export const bus = new Bus();
