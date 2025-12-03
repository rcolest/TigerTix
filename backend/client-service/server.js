import express from 'express';
import cors from 'cors';
import clientRoutes from './routes/clientRoutes.js';

const app = express();

app.use(cors({
  origin: "http://localhost:3000", 
  credentials: true 
}));

app.use(express.json());
app.use('/api', clientRoutes);

export default app;

