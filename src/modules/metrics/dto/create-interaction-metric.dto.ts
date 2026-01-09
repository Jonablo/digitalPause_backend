import { IsDateString, IsInt, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInteractionMetricDto {
  @ApiProperty({ example: '2026-01-10' })
  @IsDateString()
  recordDate: string;

  @ApiProperty({ example: 1200 })
  @IsInt()
  tapsCount: number;

  @ApiProperty({ example: 350 })
  @IsInt()
  scrollEvents: number;

  @ApiProperty({ example: 2.1, required: false })
  @IsNumber()
  @IsOptional()
  avgScrollSpeed?: number;
}
