import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AnonymousLoginDto } from './dto/anonymous-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('anonymous')                         // POST /auth/anonymous
  loginAnonymous(@Body() dto: AnonymousLoginDto) {
    return this.authService.loginAnonymous(dto.deviceId);
  }
}