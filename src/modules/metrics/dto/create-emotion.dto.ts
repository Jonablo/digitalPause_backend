import { IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmotionDto {
  @ApiProperty({ example: 'frustration' })
  @IsString()
  emotion: string;

  @ApiProperty({ example: 0.78 })
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence: number;
}
