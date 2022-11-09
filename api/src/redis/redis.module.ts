import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Redis from 'redis';

import { REDIS } from '../constants';

@Module({
  providers: [
    ConfigService,
    {
      provide: REDIS,
      useFactory: (configService: ConfigService) => {
        const redisHost: string = configService.get<string>('REDIS_HOST');
        const redisPort: number = parseInt(
          configService.get<string>('REDIS_PORT'),
        );
        const redisUsername: string =
          configService.get<string>('REDIS_USERNAME');
        const redisPassword: string =
          configService.get<string>('REDIS_PASSWORD');
        const client: Redis.RedisClient = Redis.createClient({
          url: `redis://${redisUsername}:${redisPassword}@${redisHost}:${redisPort}`,
        });

        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}
