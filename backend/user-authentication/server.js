const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/userAuthRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);

const PORT = 8001;
app.listen(PORT, () => {
    console.log(`Client service running on http://localhost:${PORT}`);
});