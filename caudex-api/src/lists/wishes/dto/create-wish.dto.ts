import { ApiProperty } from '@nestjs/swagger';

export class CreateWishDto {
  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  link?: string;

  @ApiProperty({ required: false })
  image?: string;

  @ApiProperty({ required: false })
  price?: number;

  @ApiProperty()
  order: number;
}
