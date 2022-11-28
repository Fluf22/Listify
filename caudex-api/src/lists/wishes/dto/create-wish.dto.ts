export class CreateWishDto {
  title: string;
  description?: string;
  link?: string;
  image?: string;
  price?: number;
  order: number;
}
