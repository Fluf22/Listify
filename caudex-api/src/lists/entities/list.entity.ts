import { List } from '@prisma/client';

export type ListEntity = Pick<List, 'firstName' | 'lastName' | 'userId'>;
