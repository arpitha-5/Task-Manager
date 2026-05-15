const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketio = require('socket.io');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect MongoDB
connectDB();

// Route files
const auth = require('./routes/authRoutes');
const projects = require('./routes/projectRoutes');
const tasks = require('./routes/taskRoutes');

const app = express();
const server = http.createServer(app);

// ================= SOCKET.IO =================
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

// Socket Connection
io.on('connection', (socket) => {
  console.log('New WebSocket Connection');

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined notification room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Make io accessible in routes
app.set('io', io);

// ================= MIDDLEWARE =================

// Body parser
app.use(express.json());

// CORS FIX
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Security headers
app.use(helmet());

// Rate Limiter
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});

app.use(limiter);

// ================= ROUTES =================

app.get('/', (req, res) => {
  res.send('TaskFlow Backend API Running');
});

app.use('/api/auth', auth);
app.use('/api/projects', projects);
app.use('/api/tasks', tasks);

// ================= SERVER =================

const PORT = process.env.PORT || 5000;

const serverInstance = server.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});

// ================= ERROR HANDLING =================

process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);

  serverInstance.close(() => process.exit(1));
});