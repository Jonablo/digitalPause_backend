import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from './entities/program.entity';
import { User } from '../users/entities/user.entity';
import { CreateProgramDto, UpdateProgramDto } from './dto/create-program.dto';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program)
    private programRepo: Repository<Program>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  private async getUser(clerkId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { clerk_id: clerkId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Convierte "HH:mm" a minutos desde medianoche
   * Ejemplo: "13:30" → 810 minutos
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Verifica si dos rangos de tiempo se superponen
   */
  private doTimesOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string,
  ): boolean {
    const start1Min = this.timeToMinutes(start1);
    const end1Min = this.timeToMinutes(end1);
    const start2Min = this.timeToMinutes(start2);
    const end2Min = this.timeToMinutes(end2);

    // Caso especial: rangos que cruzan medianoche
    const crosses1 = end1Min <= start1Min;
    const crosses2 = end2Min <= start2Min;

    if (crosses1 || crosses2) {
      // Manejo complejo de rangos que cruzan medianoche
      // Por simplicidad, rechazamos programas que cruzan medianoche
      return true;
    }

    // Verificación estándar de superposición
    return start1Min < end2Min && start2Min < end1Min;
  }

  /**
   * Verifica si hay días comunes entre dos arrays
   */
  private hasCommonDays(days1: number[], days2: number[]): boolean {
    return days1.some((day) => days2.includes(day));
  }

  /**
   * Valida que el nuevo programa no se superponga con existentes
   */
  private async validateNoOverlap(
    userId: string,
    startTime: string,
    endTime: string,
    daysOfWeek: number[],
    excludeProgramId?: string,
  ): Promise<void> {
    // Validar que startTime < endTime
    const startMin = this.timeToMinutes(startTime);
    const endMin = this.timeToMinutes(endTime);

    if (startMin >= endMin) {
      throw new BadRequestException(
        'La hora de inicio debe ser menor que la hora de fin',
      );
    }

    // Obtener todos los programas activos del usuario
    const existingPrograms = await this.programRepo.find({
      where: { user_id: userId, is_active: true },
    });

    // Filtrar el programa que se está actualizando (si aplica)
    const programsToCheck = excludeProgramId
      ? existingPrograms.filter((p) => p.id !== excludeProgramId)
      : existingPrograms;

    // Verificar superposiciones
    for (const program of programsToCheck) {
      // Verificar si tienen días en común
      if (this.hasCommonDays(daysOfWeek, program.days_of_week)) {
        // Verificar si los horarios se superponen
        if (
          this.doTimesOverlap(
            startTime,
            endTime,
            program.start_time,
            program.end_time,
          )
        ) {
          throw new BadRequestException(
            `El programa se superpone con "${program.title}" (${program.start_time} - ${program.end_time})`,
          );
        }
      }
    }
  }

  async create(clerkId: string, dto: CreateProgramDto): Promise<Program> {
    const user = await this.getUser(clerkId);

    const daysOfWeek = dto.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]; // Todos los días por defecto

    // Validar que no se superponga con programas existentes
    await this.validateNoOverlap(
      user.id,
      dto.startTime,
      dto.endTime,
      daysOfWeek,
    );

    const program = this.programRepo.create({
      user,
      user_id: user.id,
      title: dto.title,
      description: dto.description,
      start_time: dto.startTime,
      end_time: dto.endTime,
      days_of_week: daysOfWeek,
      is_active: dto.isActive !== undefined ? dto.isActive : true,
      icon: dto.icon,
    });

    return this.programRepo.save(program);
  }

  async findAll(clerkId: string): Promise<Program[]> {
    const user = await this.getUser(clerkId);
    return this.programRepo.find({
      where: { user_id: user.id },
      order: { start_time: 'ASC' },
    });
  }

  async findActive(clerkId: string): Promise<Program[]> {
    const user = await this.getUser(clerkId);
    return this.programRepo.find({
      where: { user_id: user.id, is_active: true },
      order: { start_time: 'ASC' },
    });
  }

  async findOne(clerkId: string, id: string): Promise<Program> {
    const user = await this.getUser(clerkId);
    const program = await this.programRepo.findOne({
      where: { id, user_id: user.id },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    return program;
  }

  async update(
    clerkId: string,
    id: string,
    dto: UpdateProgramDto,
  ): Promise<Program> {
    const program = await this.findOne(clerkId, id);

    // Si se están actualizando horarios, validar superposición
    const newStartTime = dto.startTime || program.start_time;
    const newEndTime = dto.endTime || program.end_time;
    const newDaysOfWeek = dto.daysOfWeek || program.days_of_week;

    await this.validateNoOverlap(
      program.user_id,
      newStartTime,
      newEndTime,
      newDaysOfWeek,
      id, // Excluir este programa de la validación
    );

    // Actualizar campos
    if (dto.title) program.title = dto.title;
    if (dto.description !== undefined) program.description = dto.description;
    if (dto.startTime) program.start_time = dto.startTime;
    if (dto.endTime) program.end_time = dto.endTime;
    if (dto.daysOfWeek) program.days_of_week = dto.daysOfWeek;
    if (dto.isActive !== undefined) program.is_active = dto.isActive;
    if (dto.icon !== undefined) program.icon = dto.icon;

    return this.programRepo.save(program);
  }

  async remove(clerkId: string, id: string): Promise<{ deleted: boolean }> {
    const program = await this.findOne(clerkId, id);
    await this.programRepo.remove(program);
    return { deleted: true };
  }

  async toggleActive(
    clerkId: string,
    id: string,
  ): Promise<{ isActive: boolean }> {
    const program = await this.findOne(clerkId, id);
    program.is_active = !program.is_active;
    await this.programRepo.save(program);
    return { isActive: program.is_active };
  }

  /**
   * Obtener el programa activo actual basado en la hora actual
   */
  async getCurrentActiveProgram(clerkId: string): Promise<Program | null> {
    const user = await this.getUser(clerkId);
    const now = new Date();
    const currentDay = now.getDay(); // 0=Dom, 1=Lun, ..., 6=Sáb
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentMinutes = this.timeToMinutes(currentTime);

    const activePrograms = await this.programRepo.find({
      where: { user_id: user.id, is_active: true },
    });

    for (const program of activePrograms) {
      // Verificar si aplica hoy
      if (!program.days_of_week.includes(currentDay)) continue;

      const startMin = this.timeToMinutes(program.start_time);
      const endMin = this.timeToMinutes(program.end_time);

      // Verificar si estamos en el rango horario
      if (currentMinutes >= startMin && currentMinutes < endMin) {
        return program;
      }
    }

    return null;
  }
}