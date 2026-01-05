import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { FamilyModule } from './modules/family/family.module'; // Changed from ChildrenModule

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    FamilyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
