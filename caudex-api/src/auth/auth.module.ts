import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { AUTH_SERVICE, MAIL_WORKER } from '../constants';
import { ClientProxyFactory, RmqOptions } from '@nestjs/microservices';
import { getRabbitMQConfig } from '../microservices/rabbitmq.helper';
import { PassportModule } from '@nestjs/passport';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [
    {
      provide: AUTH_SERVICE,
      useFactory: async (configService: ConfigService) => {
        return await AuthService.create(configService);
      },
      inject: [ConfigService],
    },
    ConfigService,
    PrismaService,
    {
      provide: MAIL_WORKER,
      useFactory: (configService: ConfigService) => {
        const rabbitMQConfig: RmqOptions = getRabbitMQConfig(configService);
        return ClientProxyFactory.create(rabbitMQConfig);
      },
      inject: [ConfigService],
    },
  ],
  imports: [
    UsersModule,
    HttpModule,
    PassportModule.register({
      session: true,
    }),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
