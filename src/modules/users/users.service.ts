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

  async bootstrap(clerkId: string): Promise<any> {
    let user = await this.usersRepository.findOne({ where: { clerk_id: clerkId } });
    
    if (!user) {
      user = this.usersRepository.create({ clerk_id: clerkId });
      await this.usersRepository.save(user);
    }

    return {
      user_id: user.id,
      created_at: user.created_at,
    };
  }
}
