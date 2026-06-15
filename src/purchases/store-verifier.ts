import { Store } from '../generated/prisma/client';

// TRẢ VỀ true nếu receipt hợp lệ. Hiện stub luôn true.
// Sau này thay bằng gọi API thật của store.
export async function verifyReceipt(
  store: Store,
  receipt: string,
  transactionId: string,
): Promise<boolean> {
  if (store === 'APPLE') {
    // TODO: gọi App Store Server API (verifyReceipt / App Store Server API mới)
    // POST receipt lên endpoint của Apple, kiểm tra status & transactionId khớp
    return true;
  }
  if (store === 'GOOGLE') {
    // TODO: gọi Google Play Developer API
    // purchases.products.get để xác nhận purchaseState = purchased
    return true;
  }
  return false;
}