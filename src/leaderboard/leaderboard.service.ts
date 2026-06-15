import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { rewardForRank, REWARD_TOP_N } from './rewards';

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  // ===== ĐỌC BẢNG XẾP HẠNG =====

  // scope: tên region cụ thể, hoặc null = global (toàn bộ)
  async getRanking(region: string | null, take = 100, skip = 0) {
    return this.prisma.user.findMany({
      where: region ? { region } : {},
      orderBy: { rankScore: 'desc' },
      take, skip,
      select: {
        id: true, displayName: true, rankScore: true,
        tier: true, region: true,
      },
    });
  }

  // hạng của chính tôi (trong khu vực của tôi)
  async getMyRank(userId: string) {
    const me = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!me) throw new NotFoundException('User không tồn tại');

    const higher = await this.prisma.user.count({
      where: { region: me.region, rankScore: { gt: me.rankScore } },
    });

    return {
      region: me.region,
      rankScore: me.rankScore,
      rank: higher + 1,           // số người điểm cao hơn + 1
    };
  }

  // ===== CRON: NGÀY CUỐI THÁNG =====

  // Chạy mỗi ngày lúc 23:55 (giờ VN). Tự kiểm tra có phải ngày cuối tháng không.
  @Cron('55 23 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async handleMonthlyResetCron() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    // nếu ngày mai sang tháng khác -> hôm nay là ngày cuối tháng
    if (tomorrow.getMonth() !== now.getMonth()) {
      console.log('🏁 Ngày cuối tháng — chạy reset leaderboard...');
      await this.runMonthlyReset();
    }
  }

  // Logic chốt giải + phát quà + reset (tách riêng để test gọi tay được)
  async runMonthlyReset() {
    const now = new Date();
    const season = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // 1. lấy danh sách region đang có
    const regionRows = await this.prisma.user.findMany({
      distinct: ['region'],
      select: { region: true },
    });
    const regions = regionRows.map((r) => r.region);

    // 2. phát quà cho top mỗi region + scope GLOBAL
    const scopes: { label: string; region: string | null }[] = [
      ...regions.map((r) => ({ label: r, region: r })),
      { label: 'GLOBAL', region: null },
    ];

    for (const scope of scopes) {
      const top = await this.getRanking(scope.region, REWARD_TOP_N, 0);

      const rewards = top
        .map((u, i) => ({
          userId: u.id,
          season,
          region: scope.label,        // 'SEA', 'NA'... hoặc 'GLOBAL'
          rank: i + 1,
          coinReward: rewardForRank(i + 1),
        }))
        .filter((r) => r.coinReward > 0);

      if (rewards.length === 0) continue;

      // lưu lịch sử quà (skipDuplicates: chạy lại không tạo trùng nhờ @@unique)
      await this.prisma.leaderboardReward.createMany({
        data: rewards,
        skipDuplicates: true,
      });

      // cộng coin cho từng người được thưởng
      for (const r of rewards) {
        await this.prisma.user.update({
          where: { id: r.userId },
          data: { coin: { increment: r.coinReward } },
        });
      }
    }

    // 3. reset điểm toàn bộ cho mùa mới
    await this.prisma.user.updateMany({
      data: { rankScore: 1000, tier: 'BRONZE' },
    });

    console.log(`✅ Reset xong mùa ${season}`);
    return { season, resetAt: now };
  }
}