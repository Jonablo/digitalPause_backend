import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ProgramsService } from './programs.service';
import { CreateProgramDto, UpdateProgramDto } from './dto/create-program.dto';

@ApiTags('Programs')
@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo programa de desconexión' })
  @ApiQuery({ name: 'clerkId', required: true })
  @ApiResponse({ status: 201, description: 'Programa creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Validación fallida o superposición detectada' })
  async create(
    @Query('clerkId') clerkId: string,
    @Body() createProgramDto: CreateProgramDto,
  ) {
    if (!clerkId) throw new BadRequestException('Clerk ID required');
    return this.programsService.create(clerkId, createProgramDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los programas del usuario' })
  @ApiQuery({ name: 'clerkId', required: true })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean, description: 'Solo programas activos' })
  async findAll(
    @Query('clerkId') clerkId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    if (!clerkId) throw new BadRequestException('Clerk ID required');
    
    const isActiveOnly = activeOnly === 'true';
    
    return isActiveOnly
      ? this.programsService.findActive(clerkId)
      : this.programsService.findAll(clerkId);
  }

  @Get('current')
  @ApiOperation({ summary: 'Obtener el programa activo en este momento' })
  @ApiQuery({ name: 'clerkId', required: true })
  @ApiResponse({ status: 200, description: 'Programa actual o null si no hay ninguno activo' })
  async getCurrentProgram(@Query('clerkId') clerkId: string) {
    if (!clerkId) throw new BadRequestException('Clerk ID required');
    return this.programsService.getCurrentActiveProgram(clerkId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un programa específico' })
  @ApiQuery({ name: 'clerkId', required: true })
  @ApiParam({ name: 'id', description: 'ID del programa' })
  async findOne(@Query('clerkId') clerkId: string, @Param('id') id: string) {
    if (!clerkId) throw new BadRequestException('Clerk ID required');
    return this.programsService.findOne(clerkId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un programa completo' })
  @ApiQuery({ name: 'clerkId', required: true })
  @ApiParam({ name: 'id', description: 'ID del programa' })
  async update(
    @Query('clerkId') clerkId: string,
    @Param('id') id: string,
    @Body() updateProgramDto: UpdateProgramDto,
  ) {
    if (!clerkId) throw new BadRequestException('Clerk ID required');
    return this.programsService.update(clerkId, id, updateProgramDto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Activar/Desactivar un programa' })
  @ApiQuery({ name: 'clerkId', required: true })
  @ApiParam({ name: 'id', description: 'ID del programa' })
  async toggleActive(@Query('clerkId') clerkId: string, @Param('id') id: string) {
    if (!clerkId) throw new BadRequestException('Clerk ID required');
    return this.programsService.toggleActive(clerkId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un programa' })
  @ApiQuery({ name: 'clerkId', required: true })
  @ApiParam({ name: 'id', description: 'ID del programa' })
  async remove(@Query('clerkId') clerkId: string, @Param('id') id: string) {
    if (!clerkId) throw new BadRequestException('Clerk ID required');
    return this.programsService.remove(clerkId, id);
  }
}