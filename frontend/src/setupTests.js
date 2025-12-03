import "@testing-library/jest-dom";

global.fetch = jest.fn();

global.SpeechRecognition = jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    onresult: null
}));

global.webkitSpeechRecognition = global.SpeechRecognition;

window.HTMLMediaElement.prototype.play = () => {};
window.HTMLMediaElement.prototype.pause = () => {};
