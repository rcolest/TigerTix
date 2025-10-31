const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

require('./models/llmModel'); 

const llmRoutes = require('./routes/llmRoutes');
app.use('/api/llm', llmRoutes);

const PORT = 7001;
app.listen(PORT, () => console.log(`✅ LLM service running on port ${PORT}`));