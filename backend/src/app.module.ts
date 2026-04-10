import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AttributesModule } from './modules/attributes/attributes.module';
import { OrdersModule } from './modules/orders/orders.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CustomersModule } from './modules/customers/customers.module';
import { MediaModule } from './modules/media/media.module';
import { SettingsModule } from './modules/settings/settings.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuditModule } from './modules/audit/audit.module';
import { LayoutModule } from './modules/layout/layout.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AppExceptionFilter } from './common/filters/app-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

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
    AttributesModule,
    OrdersModule,
    InventoryModule,
    CustomersModule,
    MediaModule,
    SettingsModule,
    DashboardModule,
    AuditModule,
    LayoutModule,
    PromotionsModule,
    AnalyticsModule,
    ReportsModule,
  ],
  providers: [
    // Global exception filter
    { provide: APP_FILTER, useClass: AppExceptionFilter },
    // Global response wrapper
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
