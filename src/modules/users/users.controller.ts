import { Controller, Post, Body, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';

// Placeholder for Auth Guard - in real app, use @nestjs/passport or Clerk SDK
// For now, we will simulate receiving the token claims in the body or headers
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('bootstrap')
  @ApiOperation({ summary: 'Initialize or retrieve user state after Auth' })
  @ApiResponse({ status: 200, description: 'User state returned successfully.' })
  async bootstrap(@Body() body: { clerkId: string; email: string }) {
    // In production, clerkId and email should be extracted from the JWT Token
    // verified by a Guard, not passed in body freely.
    // However, to keep it simple as requested:
    
    if (!body.clerkId || !body.email) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.usersService.bootstrap(body.clerkId, body.email);
  }
}
