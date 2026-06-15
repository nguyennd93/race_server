import { Tier } from '../generated/prisma/client';

// Điểm thưởng/trừ theo thứ hạng về đích
export function scoreForPosition(position: number): number {
  const table: Record<number, number> = { 1: 30, 2: 15, 3: 5 };
  return table[position] ?? -10;     // ngoài top 3 thì trừ điểm
}

export function coinForPosition(position: number): number {
  const table: Record<number, number> = { 1: 100, 2: 60, 3: 40 };
  return table[position] ?? 20;
}

// Tier suy ra từ rankScore
export function tierForScore(score: number): Tier {
  if (score >= 3000) return 'DIAMOND';
  if (score >= 2200) return 'PLATINUM';
  if (score >= 1500) return 'GOLD';
  if (score >= 1000) return 'SILVER';
  return 'BRONZE';
}