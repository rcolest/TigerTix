const authModel = require('../models/userAuthModel');

exports.registerNewAccount = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    authModel.registerNewAccount({ username, password }, (err, result) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Successfully registered account', userId: result.id });
    });
};

exports.loginAccount = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    authModel.findLoginInfo({ username, password }, (err, result) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Successfully logged in', event: result });
    });
};