import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders TigerTix title", () => {
  render(<App />);
  expect(screen.getByText(/TigerTix/i)).toBeInTheDocument();
});
