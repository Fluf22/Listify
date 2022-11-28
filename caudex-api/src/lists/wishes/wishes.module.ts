import { Module } from '@nestjs/common';
import { WishesService } from './wishes.service';
import { WishesController } from './wishes.controller';
import { PrismaService } from '../../prisma.service';
import { ListsService } from '../lists.service';
import { AUTH_SERVICE } from '../../constants';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';

@Module({
  controllers: [WishesController],
  providers: [
    {
      provide: AUTH_SERVICE,
      useFactory: async (configService: ConfigService) => {
        return await AuthService.create(configService);
      },
      inject: [ConfigService],
    },
    ConfigService,
    WishesService,
    PrismaService,
    ListsService,
  ],
})
export class WishesModule {}
