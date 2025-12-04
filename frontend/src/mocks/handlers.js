import { http, HttpResponse } from 'msw';

export const handlers = [
  // GET events list
  http.get('/api/events', () => {
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
  http.post('/api/login', () => {
    return HttpResponse.json({
      token: "FAKE_JWT",
      email: "test-email@example.com"
    });
  }),

  // POST purchase
  http.post('/api/events/:id/purchase', ({ params }) => {
    return HttpResponse.json({
      event: {
        id: Number(params.id),
        name: "Basketball Game",
        date: "2025-02-10",
        num_tickets: 49
      }
    });
  })
];
