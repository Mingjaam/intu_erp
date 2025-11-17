import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // JWT가 없어도 에러를 발생시키지 않고 계속 진행
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // 에러가 있거나 사용자가 없어도 계속 진행 (null 반환)
    return user || null;
  }
}

