import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,   // inject DB
    private readonly jwt: JwtService,          // inject bộ ký JWT
  ) {}

  async loginAnonymous(deviceId: string) {
    // tìm user theo device, chưa có thì tạo mới (upsert = update-or-insert)
    const user = await this.prisma.user.upsert({
      where: { deviceId },
      update: {},                              // đã có thì không đổi gì
      create: { deviceId },                    // chưa có thì tạo với giá trị mặc định
    });

    const token = await this.jwt.signAsync({ sub: user.id });
    return {
      accessToken: token,
      user: {
        id: user.id,
        displayName: user.displayName,
        rankScore: user.rankScore,
        tier: user.tier,
        coin: user.coin,
      },
    };
  }
}