import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import workspaceRoutes from './routes/workspaceRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import aiRoutes from './routes/aiRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import messageRoutes from './routes/messageRoutes';
import notificationRoutes from './routes/notificationRoutes';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app: Application = express();

// 1. CORS - MUST BE FIRST
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Security & Parsers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json());
app.use(cookieParser());

// 3. Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 5000 // Increased from 100 to 5000 to prevent 429 errors in development
});
app.use('/api', limiter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }
});

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_workspace', (workspaceId: string) => {
    socket.join(workspaceId);
    console.log(`User joined workspace: ${workspaceId}`);
  });

  socket.on('join_project', (projectId: string) => {
    socket.join(projectId);
    console.log(`User joined project: ${projectId}`);
  });

  socket.on('join_notifications', (userId: string) => {
    socket.join(userId);
    console.log(`User joined notification room: ${userId}`);
  });

  socket.on('task_updated', (data: any) => {
    socket.to(data.projectId).emit('task_updated', data);
  });

  // Chat events
  socket.on('join_conversation', (conversationId: string) => {
    socket.join(`conv_${conversationId}`);
  });

  socket.on('typing', (data: { conversationId: string; userName: string }) => {
    socket.to(`conv_${data.conversationId}`).emit('user_typing', data);
  });

  socket.on('stop_typing', (data: { conversationId: string }) => {
    socket.to(`conv_${data.conversationId}`).emit('user_stop_typing', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Make io accessible in request
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to TaskFlow Pro API' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
