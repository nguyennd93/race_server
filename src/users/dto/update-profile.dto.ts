import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  displayName!: string;
}