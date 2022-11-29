import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { credentials: true, origin: '*' },
  path: '/api/v1/lists/messages',
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger: Logger = new Logger(MessagesGateway.name);
  private readonly clients: any[] = [];

  handleConnection(client: any): any {
    this.logger.log('Client connected');
    this.clients.push(client);
  }

  handleDisconnect(client: any): any {
    this.logger.log('Client disconnected');
    for (let i = 0; i < this.clients.length; i++) {
      if (this.clients[i] === client) {
        this.clients.splice(i, 1);
        break;
      }
    }
  }

  private broadcast(event, message: any, excludedClient: any) {
    const broadCastMessage = JSON.stringify({ event, data: message });
    for (const client of this.clients) {
      if (client !== excludedClient) {
        client.send(broadCastMessage);
      }
    }
  }

  @SubscribeMessage('message')
  handleMessage(client: any, data: any): string {
    this.logger.log(data);
    this.broadcast('message', data, client);
    return 'Hello world!';
  }
}
