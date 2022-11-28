import { Controller, Get, Logger, Session, UseGuards } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { ListsService } from './lists.service';
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
  @UseGuards(SessionGuard, RolesGuard)
  findAll(@Session() session): Promise<List[]> {
    return this.listsService.findAll((session as any).user);
  }
}
