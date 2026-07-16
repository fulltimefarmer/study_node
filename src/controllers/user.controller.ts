// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { User, CreateUserDto, UpdateUserDto } from '../types/user';

// 内存数据库：用户列表
let users: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    age: 25,
    createdAt: new Date().toISOString()
  }
];
let nextId = 2;

// 1. 获取所有用户
export const getAllUsers = (req: Request, res: Response<User[]>) => {
  res.status(200).json(users);
};

// 2. 根据 ID 获取单个用户
export const getUserById = (req: Request<{ id: string }>, res: Response<User | { message: string }>) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);
  
  if (!user) {
    return res.status(404).json({ message: '用户不存在' });
  }
  res.status(200).json(user);
};

// 3. 创建新用户
export const createUser = (req: Request<{}, {}, CreateUserDto>, res: Response<User>) => {
  const { username, email, age } = req.body;
  
  const newUser: User = {
    id: nextId++,
    username,
    email,
    age,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  res.status(201).json(newUser); // 201 = 创建成功
};

// 4. 更新用户
export const updateUser = (req: Request<{ id: string }, {}, UpdateUserDto>, res: Response<User | { message: string }>) => {
  const id = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: '用户不存在' });
  }
  
  // 合并旧数据和新数据
  users[userIndex] = { ...users[userIndex], ...req.body };
  res.status(200).json(users[userIndex]);
};

// 5. 删除用户
export const deleteUser = (req: Request<{ id: string }>, res: Response<{ message: string }>) => {
  const id = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: '用户不存在' });
  }
  
  users.splice(userIndex, 1);
  res.status(200).json({ message: '删除成功' });
};