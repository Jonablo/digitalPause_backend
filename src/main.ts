import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get ConfigService to access environment variables
  const configService = app.get(ConfigService);
  
  // Enable CORS with environment variable
  const corsOrigin = configService.get<string>('CORS_ORIGIN', '*');
  app.enableCors({
    origin: corsOrigin.split(','),
    credentials: true,
  });

  // Set Global Prefix from environment
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  app.setGlobalPrefix(apiPrefix);

  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Swagger Config
  const config = new DocumentBuilder()
    .setTitle('MindPause API')
    .setDescription('Backend API for MindPause App')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(apiPrefix, app, document);

  // Get port from environment
  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);
  const appUrl = await app.getUrl();

  console.log(`Application is running on: ${appUrl}`);
  console.log(`Swagger Docs available at: ${appUrl}/${apiPrefix}`);
  console.log(`Environment: ${configService.get<string>('NODE_ENV', 'development')}`);

}
bootstrap();