import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { AUTH_SERVICE } from '../constants';
import { AuthService } from '../auth/auth.service';
import { TokenSet, UserinfoResponse } from 'openid-client';
import { List } from './entities/list.entity';

@Injectable()
export class ListsService {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: AuthService,
  ) {}

  create(createListDto: CreateListDto) {
    throw new NotImplementedException();
  }

  findAll(user: UserinfoResponse): Promise<List[]> {
    return this.authService.fetchWishLists(user.sub);
  }

  findOne(id: number) {
    throw new NotImplementedException();
  }

  update(id: number, updateListDto: UpdateListDto) {
    throw new NotImplementedException();
  }

  remove(id: number) {
    throw new NotImplementedException();
  }
}
