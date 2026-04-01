import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserRegisteredEvent } from 'src/events/user-registered.event';

@Injectable()
export class UserRegisteredListener {
  private readonly logger = new Logger(UserRegisteredListener.name);

  @OnEvent('user.registered')
  handle(event: UserRegisteredEvent) {
    this.logger.log(
      `New user registered - id: ${event.userId}, email: ${event.email}`,
    );
  }
}
