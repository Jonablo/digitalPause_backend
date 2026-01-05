import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { FamilyRelation } from '../family/entities/family-relation.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(FamilyRelation)
    private familyRepository: Repository<FamilyRelation>,
  ) {}

  async findOneByClerkId(clerkId: string): Promise<any> {
    const user = await this.usersRepository.findOne({
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

    if (!user) return null;

    return this.enrichUserWithRole(user);
  }

  async create(createUserDto: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async bootstrap(clerkId: string, email: string): Promise<any> {
    // 1. Try to find user by Clerk ID
    let user = await this.usersRepository.findOne({
      where: { clerk_id: clerkId },
      relations: ['parent_relations', 'parent_relations.parent', 'child_relations', 'child_relations.child', 'devices', 'settings']
    });
    
    if (user) return this.enrichUserWithRole(user);

    // 2. If not found by Clerk ID, check if they were invited by Email (Shadow User)
    user = await this.usersRepository.findOne({ where: { email: email } });

    if (user) {
        // Claim the Shadow User!
        user.clerk_id = clerkId;
        user.name = email.split('@')[0]; // Update name or keep existing
        await this.usersRepository.save(user);
        
        // Reload with relations to get role
        user = await this.usersRepository.findOne({
             where: { id: user.id },
             relations: ['parent_relations', 'parent_relations.parent', 'child_relations', 'child_relations.child', 'devices', 'settings']
        });
        return this.enrichUserWithRole(user);
    }

    // 3. Create fresh user
    user = await this.create({
      clerk_id: clerkId,
      email: email,
      name: email.split('@')[0],
    });

    return this.enrichUserWithRole(user);
  }

  private enrichUserWithRole(user: User) {
      let role = 'new_user';
      
      // Logic: If I have parent_relations, someone is my parent -> I am a Child
      if (user.parent_relations && user.parent_relations.length > 0) {
          role = 'child';
      } 
      // Logic: If I have child_relations, I am a parent to someone -> I am a Parent
      else if (user.child_relations && user.child_relations.length > 0) {
          role = 'parent';
      }

      return {
          ...user,
          role: role // 'child', 'parent', 'new_user'
      };
  }
}
