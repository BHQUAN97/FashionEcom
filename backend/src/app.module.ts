import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { WinstonModule } from 'nest-winston';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { Keyv } from 'keyv';
import KeyvRedis from '@keyv/redis';
import { SanitizePipe } from './common/pipes/sanitize.pipe';
import { CsrfMiddleware } from './common/middleware/csrf.middleware';
import { winstonConfig } from './common/logger/winston.config';
import { validateEnv } from './common/config/env.validation';
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
import { SystemLogModule } from './modules/system-log/system-log.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { AppExceptionFilter } from './common/filters/app-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpLogInterceptor } from './common/interceptors/http-log.interceptor';

@Module({
  imports: [
    // Cau hinh tu .env — co validate bien moi truong fail-fast
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
      validate: validateEnv,
    }),

    // Rate limiting — 100 requests / 60s
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // Scheduled tasks (cron) — payment expire, cleanup
    ScheduleModule.forRoot(),

    // Global cache (Redis) — dung cho dashboard KPIs, report cache
    // Neu khong co REDIS_HOST -> fallback in-memory Keyv
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('REDIS_HOST');
        const port = config.get<number>('REDIS_PORT');
        const password = config.get<string>('REDIS_PASSWORD') || undefined;
        const stores: Keyv[] = [];
        if (host) {
          const url = `redis://${password ? `:${encodeURIComponent(password)}@` : ''}${host}:${port ?? 6379}`;
          stores.push(new Keyv({ store: new KeyvRedis(url) }));
        }
        return {
          // Neu khong co host, tra ve mang rong -> fallback in-memory default cua cache-manager
          ...(stores.length ? { stores } : {}),
          ttl: 60_000,
        };
      },
      inject: [ConfigService],
    }),

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
    SystemLogModule,
    IntegrationsModule,
  ],
  providers: [
    // Global exception filter
    { provide: APP_FILTER, useClass: AppExceptionFilter },
    // Global response wrapper
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    // Global HTTP request/response logger — ghi tat ca API calls vao DB
    { provide: APP_INTERCEPTOR, useClass: HttpLogInterceptor },
    // Global rate-limiting guard
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Global sanitize pipe — chong Stored XSS
    { provide: APP_PIPE, useClass: SanitizePipe },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // CSRF protection — kiem tra X-Requested-With header cho POST/PUT/DELETE
    consumer.apply(CsrfMiddleware).forRoutes('*');
  }
}
