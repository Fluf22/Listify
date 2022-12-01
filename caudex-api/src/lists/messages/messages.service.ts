import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { signedCookie } from 'cookie-parser';
import { UserinfoResponse } from 'openid-client';
import { CaudexError } from '../../interfaces';
import { ConfigService } from '@nestjs/config';
import { REDIS } from '../../constants';
import { RedisClient } from 'redis';
import { Socket } from 'socket.io';
import { MessageEntity } from './entities/message.entity';
import { ListEntity } from '../entities/list.entity';

@Injectable()
export class MessagesService {
  private readonly logger: Logger = new Logger(MessagesService.name);

  constructor(
    @Inject(REDIS) private readonly redis: RedisClient,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async fetchMessageForListWithUserId(
    userId: string,
  ): Promise<MessageEntity[]> {
    return this.prisma.message.findMany({
      where: {
        deletedAt: null,
        recipientList: {
          userId,
        },
      },
      select: {
        content: true,
        createdAt: true,
        authorList: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async createMessage(
    userId: string,
    authorId: string,
    content: string,
  ): Promise<MessageEntity> {
    return this.prisma.message.create({
      data: {
        recipientList: {
          connect: {
            userId,
          },
        },
        authorList: {
          connect: {
            userId: authorId,
          },
        },
        content,
      },
      select: {
        createdAt: true,
        content: true,
        authorList: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async extractUserFromWebSocket(
    client: Socket,
  ): Promise<ListEntity | undefined> {
    const sessionCookie: string = client.handshake.headers?.cookie
      ?.split(';')
      .find((c) => c.startsWith('connect.sid'))
      .split('=')?.[1]
      ?.trim();
    if (!sessionCookie) {
      return undefined;
    }
    const sessionID: string | boolean = signedCookie(
      sessionCookie,
      this.configService.get('SESSION_SECRET'),
    );
    if (typeof sessionID === 'boolean' && !sessionID) {
      return undefined;
    }

    return new Promise(async (resolve, reject) => {
      const cmdSuccess = this.redis.get(
        `sess:${sessionID}`,
        (err, sessionStr) => {
          if (err != null) {
            reject(false);
          }

          try {
            const session: any = JSON.parse(sessionStr);
            const user: UserinfoResponse = (session as any).user;
            this.prisma.list
              .findUnique({
                where: {
                  deletedAt: null,
                  userId: user?.sub,
                },
                select: {
                  userId: true,
                  firstName: true,
                  lastName: true,
                },
              })
              .then((list: ListEntity | null) => {
                resolve(list);
              })
              .catch((err) => {
                this.logger.error('Error while trying to fetch a list', err);
                reject(
                  new CaudexError(
                    'ws_prisma_error',
                    'Unable to fetch user data',
                  ),
                );
              });
          } catch (e) {
            reject(
              new CaudexError(
                'ws_session_error',
                'Unable to parse user session',
              ),
            );
          }
        },
      );
      if (!cmdSuccess) {
        reject(
          new CaudexError('ws_session_lost', 'Unable to find user session'),
        );
      }
    });
  }
}
