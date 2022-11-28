import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotImplementedException,
} from '@nestjs/common';
import { List } from '@prisma/client';
import { UserinfoResponse } from 'openid-client';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { AUTH_SERVICE } from '../constants';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ListsService {
  private readonly logger = new Logger(ListsService.name);

  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: AuthService,
    private prisma: PrismaService,
  ) {}

  async create(createListDto: CreateListDto): Promise<List> {
    try {
      return await this.prisma.list.create({
        data: {
          ...createListDto,
        },
      });
    } catch (e) {
      this.logger.error(
        `Unable to create a list for user '${createListDto.userId}'`,
        e,
      );
      throw new InternalServerErrorException();
    }
  }

  async findAll(user: UserinfoResponse): Promise<List[]> {
    return this.prisma.list.findMany({
      where: { deletedAt: null, NOT: { userId: user.sub } },
    });
  }
}
