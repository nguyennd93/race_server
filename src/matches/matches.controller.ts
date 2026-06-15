import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { SubmitMatchDto } from './dto/submit-match.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()                       // POST /matches
  submit(@Body() dto: SubmitMatchDto) {
    return this.matchesService.submit(dto);
  }

  @Get('me')                    // GET /matches/me?take=20&skip=0
  myHistory(
    @CurrentUser() userId: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.matchesService.historyForUser(
      userId,
      take ? +take : 20,
      skip ? +skip : 0,
    );
  }
}