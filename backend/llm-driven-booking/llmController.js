const llmModel = require('../llmModel');

exports.getChatbotOutput = (req, res) => {
	const inputMessage = req.params.message;
	llmModel.produceResponse(inputMessage, (err, result) => {
		if (err) return res.status(400).json({ error: err.message });
		return res.json({ event: result });
	});
}