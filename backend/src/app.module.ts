import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProgramsModule } from './programs/programs.module';
import { ApplicationsModule } from './applications/applications.module';
import { SelectionsModule } from './selections/selections.module';
import { VisitsModule } from './visits/visits.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { UploadModule } from './upload/upload.module';
import { UserReportsModule } from './user-reports/user-reports.module';
import { TodosModule } from './todos/todos.module';
import { ReportsModule } from './reports/reports.module';
import { User } from './database/entities/user.entity';
import { Organization } from './database/entities/organization.entity';
import { Program } from './database/entities/program.entity';
import { Application } from './database/entities/application.entity';
import { Selection } from './database/entities/selection.entity';
import { Visit } from './database/entities/visit.entity';
import { AuditLog } from './database/entities/audit-log.entity';
import { UserReport } from './database/entities/user-report.entity';
import { Todo } from './database/entities/todo.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'intu_erp',
      entities: [
        User,
        Organization,
        Program,
        Application,
        Selection,
        Visit,
        AuditLog,
        UserReport,
        Todo,
      ],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    AuthModule,
    UsersModule,
    ProgramsModule,
    ApplicationsModule,
    SelectionsModule,
    VisitsModule,
    OrganizationsModule,
    DashboardModule,
    UploadModule,
    UserReportsModule,
    TodosModule,
    ReportsModule,
  ],
})
export class AppModule {}
