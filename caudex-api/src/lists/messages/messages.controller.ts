import { Controller, Get, Logger, Param, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { SessionGuard } from '../../auth/session.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { MessageEntity } from './entities/message.entity';

@ApiTags('messages')
@Controller({
  path: 'lists/:userId/messages',
  version: '1',
})
export class MessagesController {
  private readonly logger: Logger = new Logger(MessagesController.name);

  constructor(private messagesService: MessagesService) {}

  @ApiCookieAuth()
  @Get()
  @UseGuards(SessionGuard, RolesGuard)
  findAll(@Param('userId') userId: string): Promise<MessageEntity[]> {
    return this.messagesService.fetchMessageForListWithUserId(userId);
  }
}
