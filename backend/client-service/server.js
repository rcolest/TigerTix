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

const PORT = 6001;
app.listen(PORT, () => {
  console.log(`Client service running on http://localhost:${PORT}`);
});
