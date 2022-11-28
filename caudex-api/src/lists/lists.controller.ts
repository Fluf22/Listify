import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Session,
  NotImplementedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { SessionGuard } from '../auth/session.guard';
import { RolesGuard } from '../auth/roles.guard';
import { List } from '@prisma/client';

@ApiTags('lists')
@Controller({
  version: '1',
  path: 'lists',
})
export class ListsController {
  private readonly logger: Logger = new Logger(ListsController.name);

  constructor(private readonly listsService: ListsService) {}

  @ApiCookieAuth()
  @Get()
  @UseGuards(new SessionGuard(), new RolesGuard(new Reflector()))
  findAll(@Session() session): Promise<List[]> {
    return this.listsService.findAll((session as any).user);
  }
}
