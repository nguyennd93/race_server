// productId phải khớp với product cấu hình trên App Store Connect / Google Play Console
type ProductInfo = { coin: number; amountCents: number; currency: string };

export const PRODUCTS: Record<string, ProductInfo> = {
  coin_pack_500:  { coin: 500,  amountCents: 99,  currency: 'USD' },
  coin_pack_1200: { coin: 1200, amountCents: 199, currency: 'USD' },
  coin_pack_6500: { coin: 6500, amountCents: 999, currency: 'USD' },
};