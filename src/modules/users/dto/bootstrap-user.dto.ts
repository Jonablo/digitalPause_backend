import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BootstrapUserDto {
  @ApiProperty({ example: 'user_2...' })
  @IsString()
  @IsNotEmpty()
  clerkId: string;
}
