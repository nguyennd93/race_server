import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)        // áp cho TẤT CẢ route trong controller này
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')                    // GET /users/me
  getMe(@CurrentUser() userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('me')                  // PATCH /users/me
  updateMe(
    @CurrentUser() userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }
}