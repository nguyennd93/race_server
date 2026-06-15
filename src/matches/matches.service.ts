import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitMatchDto } from './dto/submit-match.dto';
import { scoreForPosition, coinForPosition, tierForScore } from './scoring';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(dto: SubmitMatchDto) {
    // $transaction: hoặc tất cả thành công, hoặc rollback hết — tránh dữ liệu lệch
    return this.prisma.$transaction(async (tx) => {
      // 1. tạo bản ghi trận
      const match = await tx.match.create({
        data: { trackCode: dto.trackCode, finishedAt: new Date() },
      });

      // 2. với mỗi người chơi: tính điểm, cập nhật user, lưu participant
      for (const p of dto.participants) {
        const scoreDelta = scoreForPosition(p.position);
        const coinReward = coinForPosition(p.position);

        const user = await tx.user.findUnique({ where: { id: p.userId } });
        if (!user) continue;                       // bỏ qua user không tồn tại

        const newScore = Math.max(0, user.rankScore + scoreDelta);

        await tx.user.update({
          where: { id: p.userId },
          data: {
            rankScore: newScore,
            tier: tierForScore(newScore),
            coin: { increment: coinReward },        // cộng dồn an toàn
          },
        });

        await tx.matchParticipant.create({
          data: {
            matchId: match.id,
            userId: p.userId,
            position: p.position,
            finishMs: p.finishMs,
            scoreDelta,
            coinReward,
          },
        });
      }

      return { matchId: match.id };
    });
  }

  async historyForUser(userId: string, take = 20, skip = 0) {
    return this.prisma.matchParticipant.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      include: { match: true },     // kèm thông tin trận (trackCode, thời gian)
    });
  }
}