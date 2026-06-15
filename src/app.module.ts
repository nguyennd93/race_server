import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MatchesModule } from './matches/matches.module';
import { PurchasesModule } from './purchases/purchases.module';
import { ScheduleModule } from '@nestjs/schedule';
import { LeaderboardModule } from './leaderboard/leaderboard.module';

@Module({
  imports: [ScheduleModule.forRoot(),
    PrismaModule, AuthModule, UsersModule, MatchesModule, PurchasesModule,
    LeaderboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
