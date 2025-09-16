import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SelectionsService } from './selections.service';
import { SelectionsController } from './selections.controller';
import { Selection } from '@/database/entities/selection.entity';
import { Application } from '@/database/entities/application.entity';
import { User } from '@/database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Selection, Application, User])],
  controllers: [SelectionsController],
  providers: [SelectionsService],
  exports: [SelectionsService],
})
export class SelectionsModule {}
