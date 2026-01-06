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
    @Body() body: { clerkId?: string; childEmail: string }
  ) {
    const effectiveClerkId = body.clerkId || clerkId;
    if (!effectiveClerkId) throw new UnauthorizedException('Clerk ID is required');
    return this.familyService.linkChild(effectiveClerkId, body.childEmail);
  }

  @Get('children')
  @ApiOperation({ summary: 'Get all children linked to this parent account' })
  async getChildren(@Query('clerkId') clerkId: string, @Body() body: { clerkId?: string }) {
    const effectiveClerkId = body.clerkId || clerkId;
    return this.familyService.getMyChildren(effectiveClerkId);
  }

  @Post('device/:deviceId/lock')
  @ApiOperation({ summary: 'Remote Lock/Unlock a child device' })
  async lockDevice(
    @Query('clerkId') clerkId: string,
    @Param('deviceId') deviceId: string,
    @Body() body: { clerkId?: string; locked: boolean }
  ) {
    const effectiveClerkId = body.clerkId || clerkId;
    return this.familyService.toggleDeviceLock(effectiveClerkId, deviceId, body.locked);
  }

  @Post('accept')
  @ApiOperation({ summary: 'Child accepts link invitation from a Parent' })
  async acceptLink(
    @Body() body: { childClerkId: string; parentEmail: string }
  ) {
    return this.familyService.acceptLink(body.childClerkId, body.parentEmail);
  }

  @Post('device/:deviceId/register-token')
  @ApiOperation({ summary: 'Register FCM token for a device' })
  async registerToken(
    @Param('deviceId') deviceId: string,
    @Body() body: { clerkId: string; fcmToken: string }
  ) {
    return this.familyService.registerDeviceToken(body.clerkId, deviceId, body.fcmToken);
  }
}
