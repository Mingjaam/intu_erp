import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { User } from '@/database/entities/user.entity';
import { Program } from '@/database/entities/program.entity';
import { Application } from '@/database/entities/application.entity';
import { Selection } from '@/database/entities/selection.entity';
import { Visit } from '@/database/entities/visit.entity';
import { Organization } from '@/database/entities/organization.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Program,
      Application,
      Selection,
      Visit,
      Organization,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
