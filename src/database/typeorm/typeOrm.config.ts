import { config } from 'dotenv';
import { resolve } from 'path';
import { getEnvPath } from '../../common/helper/env.helper';
import { DataSourceOptions } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Color } from '../entities/color.entity';
import { Country } from '../entities/country.entity';
import { Currency } from '../entities/currency.entity';
import { Inventory } from '../entities/inventory.entity';
import { Product } from '../entities/product.entity';
import { ProductVariation } from '../entities/productVariation.entity';
import { ProductVariationPrice } from '../entities/productVariation_price.entity';
import { Role } from '../entities/role.entity';
import { Size } from '../entities/size.entity';
import { User } from '../entities/user.entity';

const envFilePath: string = getEnvPath(
  resolve(__dirname, '../..', 'common/envs'),
);
config({ path: envFilePath });

const isProduction = process.env.NODE_ENV === 'production';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  entities: [Category, Color, Country, Currency, Inventory, Product, ProductVariation, ProductVariationPrice, Role, Size, User],
  migrations: ['dist/database/migration/history/*.js'],
  logger: 'simple-console',
  synchronize: false,
  logging: !isProduction,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
};
