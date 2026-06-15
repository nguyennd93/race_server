import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class AnonymousLoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  deviceId!: string;
}