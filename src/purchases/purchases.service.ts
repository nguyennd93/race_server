import {
  Injectable, BadRequestException, ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ValidatePurchaseDto } from './dto/validate-purchase.dto';
import { PRODUCTS } from './products';
import { verifyReceipt } from './store-verifier';

@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) {}

  async validateAndGrant(userId: string, dto: ValidatePurchaseDto) {
    // 1. sản phẩm có hợp lệ không?
    const product = PRODUCTS[dto.productId];
    if (!product) throw new BadRequestException('Sản phẩm không hợp lệ');

    // 2. chống ghi trùng: giao dịch này xử lý chưa?
    const existed = await this.prisma.purchase.findUnique({
      where: { transactionId: dto.transactionId },
    });
    if (existed) {
      // đã xử lý rồi -> trả lại kết quả cũ, KHÔNG cộng coin lần nữa
      throw new ConflictException('Giao dịch đã được xử lý');
    }

    // 3. verify receipt với store
    const ok = await verifyReceipt(dto.store, dto.receipt, dto.transactionId);
    if (!ok) {
      await this.prisma.purchase.create({
        data: {
          userId, productId: dto.productId, store: dto.store,
          transactionId: dto.transactionId, receipt: dto.receipt,
          amountCents: product.amountCents, currency: product.currency,
          coinGranted: 0, status: 'FAILED',
        },
      });
      throw new BadRequestException('Receipt không hợp lệ');
    }

    // 4. hợp lệ -> lưu giao dịch + cộng coin, trong 1 transaction
    return this.prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.create({
        data: {
          userId, productId: dto.productId, store: dto.store,
          transactionId: dto.transactionId, receipt: dto.receipt,
          amountCents: product.amountCents, currency: product.currency,
          coinGranted: product.coin, status: 'VALIDATED',
          validatedAt: new Date(),
        },
      });

      const user = await tx.user.update({
        where: { id: userId },
        data: { coin: { increment: product.coin } },
      });

      return { purchaseId: purchase.id, coinGranted: product.coin, coin: user.coin };
    });
  }

  historyForUser(userId: string, take = 20, skip = 0) {
    return this.prisma.purchase.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take, skip,
    });
  }
}