import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import { AUTH_SERVICE } from '../constants';
import { AuthService } from '../auth/auth.service';

@Module({
  providers: [
    {
      provide: AUTH_SERVICE,
      useFactory: async (configService: ConfigService) => {
        return await AuthService.create(configService);
      },
      inject: [ConfigService],
    },
    UsersService,
    PrismaService,
    ConfigService,
  ],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
