import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Application } from '../database/entities/application.entity';
import { User } from '../database/entities/user.entity';
import { Program } from '../database/entities/program.entity';
import { Selection } from '../database/entities/selection.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, User, Program, Selection])
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
