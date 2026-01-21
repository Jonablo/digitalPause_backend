import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean, Matches, ArrayMinSize, ArrayMaxSize, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProgramDto {
  @ApiProperty({ example: 'Almuerzo con familia', description: 'Título del programa' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Tiempo de desconexión durante la comida', description: 'Descripción opcional' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '13:00', description: 'Hora de inicio en formato HH:mm' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime debe estar en formato HH:mm (ej: 13:00)',
  })
  startTime: string;

  @ApiProperty({ example: '14:00', description: 'Hora de fin en formato HH:mm' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime debe estar en formato HH:mm (ej: 14:00)',
  })
  endTime: string;

  @ApiPropertyOptional({ 
    example: [1, 2, 3, 4, 5], 
    description: 'Días de la semana (0=Dom, 1=Lun, ..., 6=Sáb). Por defecto: todos los días',
    type: [Number]
  })
  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek?: number[];

  @ApiPropertyOptional({ example: true, description: '¿Está activo?' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'coffee', description: 'Icono para la UI' })
  @IsString()
  @IsOptional()
  icon?: string;
}

export class UpdateProgramDto {
  @ApiPropertyOptional({ example: 'Almuerzo con familia' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Tiempo de desconexión durante la comida' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '13:00' })
  @IsString()
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime debe estar en formato HH:mm (ej: 13:00)',
  })
  startTime?: string;

  @ApiPropertyOptional({ example: '14:00' })
  @IsString()
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime debe estar en formato HH:mm (ej: 14:00)',
  })
  endTime?: string;

  @ApiPropertyOptional({ example: [1, 2, 3, 4, 5], type: [Number] })
  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek?: number[];

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'coffee' })
  @IsString()
  @IsOptional()
  icon?: string;
}