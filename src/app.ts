import cookieParser from 'cookie-parser';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config/config';
import { connectDB } from './db/db';
import { errorHandler } from './middleware/error.middleware';
import { authRoute } from './routes/auth.route';
import { ticketRoute } from './routes/ticket.route';

const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//db connection
connectDB();
app.get('/', (req: Request, res: Response) => {
  res.send('uh ! its working');
});
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/ticket', ticketRoute);
app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
});
app.use(errorHandler);
