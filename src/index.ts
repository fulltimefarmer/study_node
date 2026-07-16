// src/index.ts
import express from 'express';
import userRouter from './routes/user.routes';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';

const app = express();
const PORT = 3000;

app.use(express.json());

// 挂载用户路由，统一前缀 /api/users
app.use('/api/users', userRouter);

// 404 处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`服务运行在 http://localhost:${PORT}`);
});