import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { BootstrapUserDto } from './dto/bootstrap-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('bootstrap')
  @ApiOperation({ summary: 'Initialize or retrieve user state' })
  @ApiResponse({ status: 200, description: 'User ID returned.' })
  async bootstrap(@Body() body: BootstrapUserDto) {
    return this.usersService.bootstrap(body.clerkId);
  }
}
