import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { winstonConfig } from './common/logger/winston.config';
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
// Phase 5 — Advanced Features
import { PaymentsModule } from './modules/payments/payments.module';
import { ReturnsModule } from './modules/returns/returns.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { SearchModule } from './modules/search/search.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SecurityModule } from './modules/security/security.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { GuidesModule } from './modules/guides/guides.module';
import { AppExceptionFilter } from './common/filters/app-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

@Module({
  imports: [
    // Cau hinh tu .env
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate limiting — 100 requests / 60s
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // Structured logging
    WinstonModule.forRoot(winstonConfig),

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

    // Core Modules (Phase 1-4)
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

    // Phase 5 — Advanced Features
    PaymentsModule,
    ReturnsModule,
    LoyaltyModule,
    SuppliersModule,
    SearchModule,
    NotificationsModule,
    SecurityModule,
    ReviewsModule,
    GuidesModule,
  ],
  providers: [
    // Global exception filter
    { provide: APP_FILTER, useClass: AppExceptionFilter },
    // Global response wrapper
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    // Global rate-limiting guard
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
