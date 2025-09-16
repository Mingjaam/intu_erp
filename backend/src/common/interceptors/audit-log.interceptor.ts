import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from '../../database/entities/audit-log.entity';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return next.handle();
    }

    const method = request.method;
    const url = request.url;
    const body = request.body;
    const params = request.params;

    return next.handle().pipe(
      tap(async (data) => {
        try {
          const action = this.getActionFromMethod(method);
          const targetTable = this.getTargetTableFromUrl(url);
          const targetId = params.id || body.id;

          await this.auditLogRepository.save({
            actorId: user.id,
            action,
            targetTable,
            targetId,
            before: method === 'POST' ? null : body,
            after: method === 'DELETE' ? null : data,
            description: `${method} ${url}`,
            ipAddress: request.ip,
            userAgent: request.get('User-Agent'),
          });
        } catch (error) {
          console.error('Audit log error:', error);
        }
      }),
    );
  }

  private getActionFromMethod(method: string): AuditAction {
    switch (method) {
      case 'POST':
        return AuditAction.CREATE;
      case 'PUT':
      case 'PATCH':
        return AuditAction.UPDATE;
      case 'DELETE':
        return AuditAction.DELETE;
      default:
        return AuditAction.UPDATE;
    }
  }

  private getTargetTableFromUrl(url: string): string {
    const segments = url.split('/').filter(Boolean);
    return segments[1] || 'unknown';
  }
}
