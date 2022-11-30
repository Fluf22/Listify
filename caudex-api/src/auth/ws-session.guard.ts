import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { MessagesService } from '../lists/messages/messages.service';

@Injectable()
export class WsSessionGuard implements CanActivate {
  constructor(private readonly messagesService: MessagesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const user = await this.messagesService.extractUserFromWebSocket(client);
    context.switchToWs().getData().author = user;
    return user != null;
  }
}
