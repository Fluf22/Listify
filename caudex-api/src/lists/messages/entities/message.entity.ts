import { List, Message } from '@prisma/client';
import { ListEntity } from '../../entities/list.entity';

export type MessageEntity = Pick<Message, 'content' | 'createdAt'> & {
  authorList: ListEntity;
};
