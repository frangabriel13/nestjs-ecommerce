import { Controller, Sse } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, fromEvent, map } from 'rxjs';

@Controller('events')
export class EventsController {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  @Sse()
  stream(): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      const handler = (eventName: string, payload: unknown) => {
        subscriber.next({ data: { event: eventName, payload } } as MessageEvent);
      };

      this.eventEmitter.onAny(handler);

      return () => {
        this.eventEmitter.offAny(handler);
      };
    });
  }
}
