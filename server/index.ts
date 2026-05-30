import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import { authRouter, requireAuth, verifySocketAuth } from './auth';
import { startMarketDataStream } from './marketData';

const app = express();
const server = http.createServer(app);

// 1. Set Security HTTP Headers (Helmet)
app.use(helmet());

// 2. Strict CORS Configuration
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://your-production-domain.com'] 
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }, 
  credentials: true 
}));

// 3. Global API Rate Limiting (100 req per 15 min)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// 4. Payload Size Limiting & Sanitization
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// 5. HTTP Parameter Pollution Protection
app.use(hpp());

// Auth Routes (Login, Logout, Me)
app.use('/api', authRouter);

// Protected API route example
app.get('/api/protected-data', requireAuth, (req, res) => {
  res.json({ secret: 'This data is highly classified.' });
});

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

// Secure WebSocket connections using middleware
io.use(verifySocketAuth);

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id} (User: ${(socket as any).user.email})`);
  
  // Client can request to start/stop high-frequency stream
  let streamInterval: any;

  socket.on('subscribe_market_data', (config) => {
    console.log(`[Socket.io] Client ${socket.id} subscribed to market data.`);
    if (streamInterval) clearInterval(streamInterval);
    
    streamInterval = startMarketDataStream((dataBatch) => {
      socket.emit('market_data_batch', dataBatch);
    }, config?.intervalMs || 250);
  });

  socket.on('unsubscribe_market_data', () => {
    if (streamInterval) clearInterval(streamInterval);
  });

  socket.on('disconnect', () => {
    if (streamInterval) clearInterval(streamInterval);
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Secure Backend Server running on http://localhost:${PORT}`);
});
