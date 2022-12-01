import { Gifter, Wish } from '@prisma/client';
import { ListEntity } from '../../entities/list.entity';

type GiftedByEntity = Pick<Gifter, 'amount'> & {
  gifterList: ListEntity;
};

export type WishEntity = Pick<
  Wish,
  | 'id'
  | 'title'
  | 'description'
  | 'image'
  | 'link'
  | 'price'
  | 'order'
  | 'createdAt'
> & { giftedBy: GiftedByEntity[] };
