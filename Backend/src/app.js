import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/index.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production'
}));

const corsOrigin = [
  'https://silly-genie-ba3255.netlify.app',
  'https://routeforge-75t7.onrender.com',
  'http://localhost:5173', // development fallback
  process.env.FRONTEND_URL // additional configured URL
].filter(Boolean); // remove any falsy values

app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight OPTIONS requests
app.options('*', cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.get('/api', (req, res) => res.json({ success: true, message: 'API root available' }));
app.use('/api', routes);
app.use('/static', express.static(path.resolve(__dirname, '../public')));
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));
app.use(errorHandler);

app.get('/', (req, res) => res.json({ success: true, message: 'Backend API root is available' }));
app.get('/health', (req, res) => res.json({ success: true, message: 'API is healthy' }));

export default app;
