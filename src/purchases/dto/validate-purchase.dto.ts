import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { Store } from '../../generated/prisma/client';

export class ValidatePurchaseDto {
  @IsString() @IsNotEmpty()
  productId!: string;

  @IsEnum(Store)
  store!: Store;            // APPLE | GOOGLE

  @IsString() @IsNotEmpty()
  receipt!: string;        // receipt thô từ store

  @IsString() @IsNotEmpty()
  transactionId!: string;  // mã giao dịch duy nhất từ store
}