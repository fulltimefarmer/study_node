export interface User {
  id: number;
  username: string;
  email: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  roles: Role[];
  roleCodes: string[];
  permissionCodes: string[];
  menus?: Permission[];
}

export interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  code: string;
  type: 'menu' | 'button' | 'api';
  parentId: number | null;
  path: string;
  icon: string;
  sort: number;
  createdAt?: string;
  updatedAt?: string;
  children?: Permission[];
}

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  [key: string]: any;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
