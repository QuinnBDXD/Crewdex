import express from 'express';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Global middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount application routes under a consistent API prefix
app.use('/api', routes);

// Centralized error handler ensures consistent error responses
app.use(errorHandler);

export default app;
