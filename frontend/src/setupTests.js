import "@testing-library/jest-dom";

process.env.REACT_APP_API_URL = "http://mocked-api";

global.fetch = jest.fn((url) => {
  if (url.endsWith("/api/login")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ username: "test", token: "abc123" }),
    });
  }
  if (url.endsWith("/api/events")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          { id: 1, name: "Campus Events", tickets: 10 },
        ]),
    });
  }
  return Promise.reject(new Error(`Fetch URL not mocked: ${url}`));
});

global.SpeechRecognition = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  onresult: null,
}));

global.webkitSpeechRecognition = global.SpeechRecognition;

window.HTMLMediaElement.prototype.play = () => {};
window.HTMLMediaElement.prototype.pause = () => {};

beforeEach(() => {
  jest.clearAllMocks();
});
