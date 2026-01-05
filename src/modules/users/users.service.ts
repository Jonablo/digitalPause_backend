import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Child } from '../children/entities/child.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Child)
    private childRepository: Repository<Child>,
  ) {}

  async findOneByClerkId(clerkId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { clerk_id: clerkId },
      relations: ['children', 'children.settings'],
    });
  }

  async create(createUserDto: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async bootstrap(clerkId: string, email: string): Promise<User> {
    let user = await this.findOneByClerkId(clerkId);
    
    if (!user) {
      // First time login - create user
      user = await this.create({
        clerk_id: clerkId,
        email: email,
        name: email.split('@')[0], // Default name
      });
    }

    return user;
  }
}
