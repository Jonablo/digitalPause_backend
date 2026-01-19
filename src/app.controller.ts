import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('analyze')
  async analyze(@Query('text') text: string) {
    if (!text) {
      throw new HttpException('Text query parameter is required', HttpStatus.BAD_REQUEST);
    }
    return await this.appService.analyzeSentiment(text);
  }
}
