import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Events from "./Events";

beforeEach(() => {
    global.fetch = jest.fn((url, options) => {
        if (url.includes("/login")) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: "Login successful" })
            });
        }

        if (url.includes("/register")) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: "Register successful" })
            });
        }

        if (url.includes("/events") && (!options || options.method === "GET")) {
            return Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve([
                        {
                            id: 1,
                            name: "Basketball Game",
                            num_tickets: 10,
                            description: "A fun event!"
                        },
                        {
                            id: 2,
                            name: "Concert",
                            num_tickets: 5,
                            description: "Music concert"
                        }
                    ])
            });
        }

        if (url.includes("/purchase")) {
            return Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        event: {
                            id: 1,
                            name: "Basketball Game",
                            num_tickets: 9
                        }
                    })
            });
        }

        if (url.includes("/chatbot")) {
            return Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        reply: "Yes"
                    })
            });
        }

        return Promise.reject(new Error("Fetch URL not mocked: " + url));
    });
});

test("Site loads", async () => {
    render(<Events />);
    await screen.findByText("Login");
    expect(screen.getByText("Login")).toBeVisible();
});

test("Switch to register", async () => {
    render(<Events />);
    await screen.findByText("Login");
    await userEvent.click(screen.getByText("Register"));
    expect(screen.getByText("Already have an account?")).toBeVisible();
});

test("Logging in", async () => {
    render(<Events />);
    await screen.findByText("Login");

    await userEvent.type(screen.getByLabelText("Email"), "test@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password");

    await userEvent.click(screen.getByLabelText("Login Button"));

    await screen.findByText("Campus Events");
    expect(screen.getByText("Campus Events")).toBeVisible();
});

test("Confirmation", async () => {
    render(<Events />);
    await screen.findByText("Login");

    const buyButtons = await screen.findAllByText("Buy Ticket");
    await userEvent.click(buyButtons[0]);

    const confirm = screen.getAllByText("Yes");
    expect(confirm[0]).toBeVisible();
});

test("Book ticket", async () => {
    render(<Events />);
    await screen.findByText("Login");

    const buyButtons = await screen.findAllByText("Buy Ticket");
    await userEvent.click(buyButtons[0]);

    await userEvent.click(screen.getAllByText("Yes")[0]);

    expect(screen.getByText("Tickets Available: 9")).toBeInTheDocument();
});

test("Chatbot function", async () => {
    render(<Events />);
    await screen.findByText("Login");

    await userEvent.click(screen.getByText("Try our chatbot!"));

    const textbox = screen.getByRole("textbox");
    await userEvent.type(textbox, "book basketball game");

    await userEvent.click(screen.getByLabelText("Submit"));

    const yes = await screen.findAllByText("Yes");
    expect(yes[0]).toBeVisible();
});
