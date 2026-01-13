import { SetMetadata } from '@nestjs/common';
import { ROLES } from './roles.constants';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: (keyof typeof ROLES | string)[]) =>
  SetMetadata(ROLES_KEY, roles);
export { ROLES };
