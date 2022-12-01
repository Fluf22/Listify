import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UserinfoResponse } from 'openid-client';
import { CreateListDto } from './dto/create-list.dto';
import { AUTH_SERVICE } from '../constants';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma.service';
import { ListEntity } from './entities/list.entity';

@Injectable()
export class ListsService {
  private readonly logger = new Logger(ListsService.name);

  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: AuthService,
    private prisma: PrismaService,
  ) {}

  async create(createListDto: CreateListDto): Promise<ListEntity> {
    try {
      return await this.prisma.list.create({
        data: {
          ...createListDto,
        },
        select: {
          userId: true,
          firstName: true,
          lastName: true,
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

  async findAll(user: UserinfoResponse): Promise<ListEntity[]> {
    return this.prisma.list.findMany({
      where: { deletedAt: null, NOT: { userId: user.sub } },
      select: { userId: true, firstName: true, lastName: true },
    });
  }
}
