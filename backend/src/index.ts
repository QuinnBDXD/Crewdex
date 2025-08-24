import express from 'express';
import routes from './routes';

const app = express();

// Global middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount application routes
app.use('/', routes);

export default app;
