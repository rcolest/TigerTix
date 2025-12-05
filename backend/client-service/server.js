import express from 'express';
import cors from 'cors';
import clientRoutes from './routes/clientRoutes.js';

const app = express();

app.use(cors({
  origin: ["https://tiger-tix-lovat.vercel.app"],
  credentials: true
}));

app.options("/*", cors());

app.use(express.json());
app.use('/api', clientRoutes);

export default app;
