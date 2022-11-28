export class RedeemWishDto {
  type: 'REDEEM' | 'REMOVE';
  amount: number;
}

export enum RedeemType {
  REDEEM = 'REDEEM',
  REMOVE = 'REMOVE',
}
