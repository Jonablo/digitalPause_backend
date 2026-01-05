import { Controller, Post, Get, Body, Query, Patch, Param, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FamilyService } from './family.service';

@ApiTags('family')
@Controller('family')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post('link')
  @ApiOperation({ summary: 'Link a child account by email (Family Link style)' })
  async linkChild(
    @Query('clerkId') clerkId: string, 
    @Body() body: { childEmail: string }
  ) {
    if (!clerkId) throw new UnauthorizedException('Clerk ID is required');
    return this.familyService.linkChild(clerkId, body.childEmail);
  }

  @Get('children')
  @ApiOperation({ summary: 'Get all children linked to this parent account' })
  async getChildren(@Query('clerkId') clerkId: string) {
    return this.familyService.getMyChildren(clerkId);
  }

  @Post('device/:deviceId/lock')
  @ApiOperation({ summary: 'Remote Lock/Unlock a child device' })
  async lockDevice(
    @Query('clerkId') clerkId: string,
    @Param('deviceId') deviceId: string,
    @Body() body: { locked: boolean }
  ) {
    return this.familyService.toggleDeviceLock(clerkId, deviceId, body.locked);
  }
}
