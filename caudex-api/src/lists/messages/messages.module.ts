import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { AUTH_SERVICE } from '../../constants';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { RedisModule } from '../../redis/redis.module';
import { MessagesGateway } from './messages.gateway';

@Module({
  controllers: [MessagesController],
  providers: [
    {
      provide: AUTH_SERVICE,
      useFactory: async (configService: ConfigService) => {
        return await AuthService.create(configService);
      },
      inject: [ConfigService],
    },
    ConfigService,
    MessagesService,
    MessagesGateway,
    PrismaService,
  ],
  imports: [RedisModule],
})
export class MessagesModule {}
