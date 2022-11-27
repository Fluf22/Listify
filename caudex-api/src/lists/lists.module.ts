import { Module } from '@nestjs/common';
import { ListsService } from './lists.service';
import { ListsController } from './lists.controller';
import { WishesModule } from './wishes/wishes.module';
import { AUTH_SERVICE } from '../constants';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth/auth.service';

@Module({
  controllers: [ListsController],
  providers: [
    {
      provide: AUTH_SERVICE,
      useFactory: async (configService: ConfigService) => {
        return await AuthService.create(configService);
      },
      inject: [ConfigService],
    },
    ConfigService,
    ListsService,
  ],
  imports: [WishesModule],
})
export class ListsModule {}
