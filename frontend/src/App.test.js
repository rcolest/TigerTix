import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

test("logs in and loads events", async () => {
  render(<App />);

  fireEvent.change(screen.getByPlaceholderText(/username/i), {
    target: { value: "test" },
  });

  fireEvent.change(screen.getByPlaceholderText(/password/i), {
    target: { value: "testpass" },
  });

  fireEvent.click(screen.getByRole("button", { name: /login/i }));

  const eventsHeader = await screen.findByText(/Campus Events/i);

  expect(eventsHeader).toBeInTheDocument();
});
