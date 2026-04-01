import { Module } from '@nestjs/common';
import { ProductService } from './services/product.service';
import { ProductActivatedListener } from './listeners/product-activated.listener';
import { ProductController } from './controllers/product.controller';
import { Category } from '../../database/entities/category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { User } from '../../database/entities/user.entity';
import { Product } from 'src/database/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Product, Category]), UserModule],
  controllers: [ProductController],
  providers: [ProductService, ProductActivatedListener],
})
export class ProductModule {}
