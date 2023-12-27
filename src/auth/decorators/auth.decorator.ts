import { UseGuards, applyDecorators } from '@nestjs/common';
import { RoleUser } from 'src/user/user.interface';
import { JwtGuard } from '../guards/jwt.guard';
import { OnlyAdminGuard } from '../guards/admin.guard';
import { OnlyInstructorGuard } from '../guards/instructor.guard';

export function Auth(role: RoleUser = 'USER') {
  return applyDecorators(
    (role === 'ADMIN' && UseGuards(JwtGuard, OnlyAdminGuard)) ||
      (role === 'USER' && UseGuards(JwtGuard)) ||
      (role === 'INSTRUCTOR' && UseGuards(JwtGuard, OnlyInstructorGuard)),
  );
}
