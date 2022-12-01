import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { WsSessionGuard } from '../../auth/ws-session.guard';
import { CaudexError } from '../../interfaces';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({
  cors: { credentials: true, origin: '*' },
  namespace: '/api/v1/lists/messages',
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger: Logger = new Logger(MessagesGateway.name);

  constructor(private messagesService: MessagesService) {}

  async handleConnection(client: Socket): Promise<void> {
    const connectedUser = await this.messagesService.extractUserFromWebSocket(
      client,
    );

    if (connectedUser != null) {
      this.logger.log(
        `${connectedUser.firstName} ${connectedUser.lastName} connected!`,
      );
    } else {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const connectedUser = await this.messagesService.extractUserFromWebSocket(
      client,
    );

    if (connectedUser != null) {
      this.logger.log(
        `${connectedUser.firstName} ${connectedUser.lastName} disconnected!`,
      );
    }
  }

  @UseGuards(WsSessionGuard)
  @SubscribeMessage('message')
  async handleMessage(@MessageBody() message: CreateMessageDto): Promise<void> {
    const { userId, content, authorList } = message ?? {};
    if (userId == null || content == null || authorList == null) {
      const msgError = new CaudexError('ws_bad_format', 'Bad message format');
      this.logger.error(msgError);
      throw new WsException(msgError);
    }

    const messageToBroadcast = await this.messagesService.createMessage(
      userId,
      authorList.userId,
      content,
    );
    this.server.emit('message', messageToBroadcast);
  }
}
