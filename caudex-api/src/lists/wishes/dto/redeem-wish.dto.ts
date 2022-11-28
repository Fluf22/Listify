import { ApiProperty } from '@nestjs/swagger';

export enum RedeemType {
  REDEEM = 'REDEEM',
  REMOVE = 'REMOVE',
}

export class RedeemWishDto {
  @ApiProperty({ enum: RedeemType })
  type: 'REDEEM' | 'REMOVE';

  @ApiProperty({ minimum: 0, maximum: 100 })
  amount: number;
}
