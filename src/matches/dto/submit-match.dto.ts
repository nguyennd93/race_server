import { Type } from 'class-transformer';
import {
  IsArray, IsInt, IsOptional, IsString, Min,
  ValidateNested, ArrayMinSize,
} from 'class-validator';

class ParticipantResultDto {
  @IsString()
  userId!: string;

  @IsInt() @Min(1)
  position!: number;        // về hạng mấy

  @IsOptional() @IsInt() @Min(0)
  finishMs?: number;        // thời gian hoàn thành (ms)
}

export class SubmitMatchDto {
  @IsString()
  trackCode!: string;

  @IsArray()
  @ArrayMinSize(2)          // PvP cần ít nhất 2 người
  @ValidateNested({ each: true })
  @Type(() => ParticipantResultDto)
  participants!: ParticipantResultDto[];
}