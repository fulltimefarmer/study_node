import { Request } from 'express';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  status: string;
  roles: { id: number; name: string; code: string }[];
  roleCodes: string[];
  permissionCodes: string[];
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
