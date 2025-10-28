// See https://github.com/ollama/ollama-js
import ollama from 'ollama';

exports.produceResponse = async (message, callback) => {
    const response = await ollama.chat({
        model: 'llama3.1',
        messages: [{ role: 'user', content: message }],
    });
    return callback(null, response.message.content);
}