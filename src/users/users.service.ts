import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { equippedCar: true },        // lấy kèm thông tin xe đang gắn
    });
    if (!user) throw new NotFoundException('User không tồn tại');

    // không trả những field nội bộ không cần thiết cho client
    const { deviceId, ...profile } = user;
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { displayName: dto.displayName },
    });
  }
}