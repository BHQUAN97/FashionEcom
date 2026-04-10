import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { OrdersModule } from './modules/orders/orders.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CustomersModule } from './modules/customers/customers.module';
import { MediaModule } from './modules/media/media.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [
    // Cau hinh tu .env
    ConfigModule.forRoot({ isGlobal: true }),

    // MySQL connection
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3309),
        username: config.get('DB_USERNAME', 'fashionecom'),
        password: config.get('DB_PASSWORD', 'fashionecom_dev'),
        database: config.get('DB_NAME', 'fashion_ecom'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // KHONG tu dong sync — dung db/changelog
        charset: 'utf8mb4',
      }),
    }),

    // Modules
    HealthModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    InventoryModule,
    CustomersModule,
    MediaModule,
    SettingsModule,
  ],
})
export class AppModule {}
