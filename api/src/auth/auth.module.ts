import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { PasswordService } from '../password.service';
import { PrismaService } from '../prisma.service';
import { LocalStrategy } from './local.strategy';
import { MAIL_WORKER } from '../constants';
import { ClientProxyFactory, RmqOptions } from '@nestjs/microservices';
import { getRabbitMQConfig } from '../microservices/rabbitmq.helper';

@Module({
  providers: [
    AuthService,
    ConfigService,
    PasswordService,
    LocalStrategy,
    JwtStrategy,
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
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRY'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
