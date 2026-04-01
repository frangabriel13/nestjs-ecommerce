import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { SucessResponseInterceptor } from 'src/common/helper/sucess-response.interceptor';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { ProductModule } from './product/product.module';
import { ErrorsFilter } from 'src/errors/errors.filter';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventsController } from './events/events.controller';

@Module({
  imports: [EventEmitterModule.forRoot(), AuthModule, UserModule, RoleModule, ProductModule],
  controllers: [EventsController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SucessResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ErrorsFilter,
    },
  ],
})
export class ApiModule {}
