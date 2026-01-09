import { IsDateString, IsInt, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsageMetricDto {
  @ApiProperty({ example: '2026-01-10' })
  @IsDateString()
  usageDate: string;

  @ApiProperty({ example: 14400 })
  @IsInt()
  totalUsageSeconds: number;

  @ApiProperty({ example: 18 })
  @IsInt()
  sessionsCount: number;

  @ApiProperty({ example: 4200 })
  @IsInt()
  longestSessionSeconds: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  nightUsage: boolean;
}
