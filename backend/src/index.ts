import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import prisma from './config/prisma';
import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';
import roleRouter from './routes/role.routes';
import permissionRouter from './routes/permission.routes';
import siteRouter from './routes/site.routes';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Admin API is running' });
});

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/roles', roleRouter);
app.use('/api/permissions', permissionRouter);
app.use('/api/sites', siteRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ 数据库连接成功');

    app.listen(PORT, () => {
      console.log(`🚀 服务运行在 http://localhost:${PORT}`);
      console.log(`📚 API 文档前缀: /api`);
    });
  } catch (error) {
    console.error('❌ 服务启动失败:', error);
    process.exit(1);
  }
};

startServer();
