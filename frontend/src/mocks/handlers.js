import { http, HttpResponse } from "msw";

const API = process.env.REACT_APP_API_URL;

export const handlers = [
  http.get(`${API}/api/events`, () => {
    return HttpResponse.json([
      {
        id: 1,
        name: "Basketball Game",
        date: "2025-02-10",
        num_tickets: 50
      }
    ]);
  }),

  http.post(`${API}/api/login`, () => {
    return HttpResponse.json({
      token: "FAKE_JWT",
      email: "test-email@example.com",
    });
  }),

  http.post(`${API}/api/events/1/purchase`, () => {
    return HttpResponse.json({
      event: {
        id: 1,
        name: "Basketball Game",
        date: "2025-02-10",
        num_tickets: 49,
      },
    });
  }),
];
