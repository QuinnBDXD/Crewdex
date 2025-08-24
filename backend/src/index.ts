import express from 'express';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Global middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount application routes
app.use('/', routes);

// Centralized error handler ensures consistent error responses
app.use(errorHandler);

export default app;
