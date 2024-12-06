import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { validateClerkToken } from './middleware/auth';
import { mikrotikRouter } from './routes/mikrotik.routes';
import { whatsappRouter } from './routes/whatsapp.routes';
import { userRouter } from './routes/user.routes';
import { config } from './config';
import { logger } from './utils/logger';

const app = express();

// Connect to MongoDB
connectDB().catch((err) => {
  logger.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth Middleware
app.use(validateClerkToken);

// Routes
app.use('/api/mikrotik', mikrotikRouter);
app.use('/api/whatsapp', whatsappRouter);
app.use('/api/users', userRouter);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;