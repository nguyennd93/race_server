import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('leaderboard')
export class LeaderboardController {
    constructor(private readonly leaderboardService: LeaderboardService) { }

    @Get()                        // GET /leaderboard?region=SEA   (bỏ region = global)
    ranking(
        @Query('region') region?: string,
        @Query('take') take?: string,
    ) {
        return this.leaderboardService.getRanking(
            region ?? null,
            take ? +take : 100,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')                    // GET /leaderboard/me
    myRank(@CurrentUser() userId: string) {
        return this.leaderboardService.getMyRank(userId);
    }

    // CHỈ ĐỂ TEST — production phải bảo vệ bằng quyền admin hoặc xóa đi!
    @Post('admin/run-reset')
    runResetNow() {
        return this.leaderboardService.runMonthlyReset();
    }
}