import { List } from '@prisma/client';

export class CreateMessageDto {
  userId: string;
  authorList: List;
  content: string;
}
