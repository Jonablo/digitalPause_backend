import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOneByClerkId(clerkId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { clerk_id: clerkId },
      // Now we load family relations instead of 'children'
      relations: [
          'parent_relations', // If I am a child, who is my parent?
          'parent_relations.parent',
          'child_relations', // If I am a parent, who are my children?
          'child_relations.child',
          'devices',
          'settings'
      ],
    });
  }

  async create(createUserDto: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async bootstrap(clerkId: string, email: string): Promise<User> {
    // 1. Try to find user by Clerk ID
    let user = await this.findOneByClerkId(clerkId);
    
    if (user) return user;

    // 2. If not found by Clerk ID, check if they were invited by Email (Shadow User)
    user = await this.usersRepository.findOne({ where: { email: email } });

    if (user) {
        // Claim the Shadow User!
        user.clerk_id = clerkId;
        user.name = email.split('@')[0]; // Update name or keep existing
        return this.usersRepository.save(user);
    }

    // 3. Create fresh user
    user = await this.create({
      clerk_id: clerkId,
      email: email,
      name: email.split('@')[0],
    });

    return user;
  }
}
