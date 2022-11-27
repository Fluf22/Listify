import {
  CacheModule,
  Inject,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import * as redisStore from 'cache-manager-redis-store';
import * as RedisStoreConnect from 'connect-redis';
import { ClientOpts, RedisClient } from 'redis';
import * as session from 'express-session';
import * as passport from 'passport';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { MailWorkerModule } from './microservices/mail-worker/mail-worker.module';
import { REDIS } from './constants';
import { RedisModule } from './redis/redis.module';
import { ListsModule } from './lists/lists.module';
import { ListsModule } from './lists/lists.module';

@Module({
  imports: [
    // Security
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),

    // Global modules
    ConfigModule.forRoot({
      ignoreEnvFile: false,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'static'),
    }),
    CacheModule.registerAsync<ClientOpts>({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST'),
        port: parseInt(configService.get<string>('REDIS_PORT')),
        username: configService.get<string>('REDIS_USERNAME'),
        password: configService.get<string>('REDIS_PASSWORD'),
        ttl: parseInt(configService.get<string>('REDIS_TTL')),
      }),
      isGlobal: true,
    }),

    // App Modules
    AuthModule,
    UsersModule,
    HealthModule,
    MailWorkerModule,
    RedisModule,
    ListsModule,
  ],
})
export class AppModule implements NestModule {
  constructor(
    @Inject(REDIS) private readonly redis: RedisClient,
    private configService: ConfigService,
  ) {}
  configure(consumer: MiddlewareConsumer) {
    const RedisClient = RedisStoreConnect(session);
    consumer
      .apply(
        session({
          store: new RedisClient({ client: this.redis }),
          secret: this.configService.get('SESSION_SECRET'),
          saveUninitialized: false,
          resave: false,
          cookie: {
            secure: this.configService.get('SESSION_SECURE') === 'true',
            sameSite: this.configService.get('SESSION_SAME_SITE'),
            httpOnly: true,
          },
        }),
        passport.initialize(),
        passport.session(),
      )
      .forRoutes('*');
  }
}
