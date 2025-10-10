const express = require('express');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/adminRoutes');
const { execSync } = require('child_process');

const app = express();
const PORT = 5001;

app.use(bodyParser.json());

// Run DB setup script
execSync('node ./setup.js', { stdio: 'inherit' });

// Routes
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`Admin service running on http://localhost:${PORT}`);
});