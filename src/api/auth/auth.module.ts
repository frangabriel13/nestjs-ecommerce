import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { User } from '../../database/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { RoleModule } from '../role/role.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UserRegisteredListener } from './listeners/user-registered.listener';
@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '3h' },
    }),
    RoleModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRegisteredListener],
  exports: [],
})
export class AuthModule {}
