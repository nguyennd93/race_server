import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { ValidatePurchaseDto } from './dto/validate-purchase.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post('validate')             // POST /purchases/validate
  validate(
    @CurrentUser() userId: string,
    @Body() dto: ValidatePurchaseDto,
  ) {
    return this.purchasesService.validateAndGrant(userId, dto);
  }

  @Get('me')                    // GET /purchases/me
  myHistory(@CurrentUser() userId: string) {
    return this.purchasesService.historyForUser(userId);
  }
}