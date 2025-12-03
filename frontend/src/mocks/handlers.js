import { http, HttpResponse } from 'msw';

export const handlers = [
  // GET events list
  http.get('http://localhost:6001/api/events', () => {
    return HttpResponse.json([
      {
        id: 1,
        name: "Basketball Game",
        date: "2025-02-10",
        num_tickets: 50
      }
    ]);
  }),

  // POST login
  http.post('http://localhost:8001/api/login', async () => {
    return HttpResponse.json({
      token: "FAKE_JWT",
      email: "test-email@example.com"
    });
  }),

  // POST purchase
  http.post('http://localhost:6001/api/events/1/purchase', () => {
    return HttpResponse.json({
      event: {
        id: 1,
        name: "Basketball Game",
        date: "2025-02-10",
        num_tickets: 49
      }
    });
  })
];
