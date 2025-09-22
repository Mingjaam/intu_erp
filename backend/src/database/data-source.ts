import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './entities/user.entity';
import { Organization } from './entities/organization.entity';
import { Program } from './entities/program.entity';
import { Application } from './entities/application.entity';
import { Selection } from './entities/selection.entity';
import { Visit } from './entities/visit.entity';
import { AuditLog } from './entities/audit-log.entity';
import { UserReport } from './entities/user-report.entity';

config();

export const AppDataSource = new DataSource({
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
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
