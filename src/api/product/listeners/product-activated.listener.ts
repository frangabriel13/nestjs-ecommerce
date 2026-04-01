import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ProductActivatedEvent } from 'src/events/product-activated.event';

@Injectable()
export class ProductActivatedListener {
  private readonly logger = new Logger(ProductActivatedListener.name);

  @OnEvent('product.activated')
  handle(event: ProductActivatedEvent) {
    this.logger.log(
      `Product activated - productId: ${event.productId}, merchantId: ${event.merchantId}`,
    );
  }
}
