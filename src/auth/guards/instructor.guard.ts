import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserDocument } from 'src/user/user.schema';

@Injectable()
export class OnlyInstructorGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user: UserDocument }>();
    const user = request.user;

    if (user.role !== 'INSTRUCTOR')
      throw new ForbiddenException("You don't have access to this route");

    return user.role === 'INSTRUCTOR' && true;
  }
}
