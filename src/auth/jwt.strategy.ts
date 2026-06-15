import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // đọc "Bearer <token>"
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  // payload là nội dung đã giải mã từ token; giá trị trả về sẽ gắn vào request.user
  async validate(payload: { sub: string }) {
    return { userId: payload.sub };
  }
}