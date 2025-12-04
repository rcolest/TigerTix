import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Events from "./Events";

const API = "https://tigertix-0qva.onrender.com";

beforeEach(() => {
    global.fetch = jest.fn((url, options) => {

        // --- LOGIN ---
        if (url === `${API}/api/login`) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    token: "FAKE_TOKEN",
                    email: "test@example.com"
                })
            });
        }

        // --- REGISTER ---
        if (url === `${API}/api/register`) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    message: "Register successful"
                })
            });
        }

        // --- GET EVENTS ---
        if (url === `${API}/api/events` && (!options || options.method === "GET")) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([
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

        // --- PURCHASE EVENT ---
        if (url === `${API}/api/events/1/purchase`) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    event: {
                        id: 1,
                        name: "Basketball Game",
                        num_tickets: 9
                    }
                })
            });
        }

        // --- CHATBOT ---
        if (url === `${API}/api/chatbot`) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    reply: "Yes"
                })
            });
        }

        return Promise.reject(new Error("Fetch URL not mocked: " + url));
    });
});


// ------------------------ TESTS ------------------------

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

    // login first
    await userEvent.type(screen.getByLabelText("Email"), "x");
    await userEvent.type(screen.getByLabelText("Password"), "x");
    await userEvent.click(screen.getByLabelText("Login Button"));
    await screen.findByText("Campus Events");

    const buyButtons = await screen.findAllByText("Buy Ticket");
    await userEvent.click(buyButtons[0]);

    const confirm = screen.getAllByText("Yes");
    expect(confirm[0]).toBeVisible();
});

test("Book ticket", async () => {
    render(<Events />);
    await screen.findByText("Login");

    await userEvent.type(screen.getByLabelText("Email"), "x");
    await userEvent.type(screen.getByLabelText("Password"), "x");
    await userEvent.click(screen.getByLabelText("Login Button"));
    await screen.findByText("Campus Events");

    const buyButtons = await screen.findAllByText("Buy Ticket");
    await userEvent.click(buyButtons[0]);
    await userEvent.click(screen.getAllByText("Yes")[0]);

    expect(screen.getByText("Tickets Available: 9")).toBeInTheDocument();
});

test("Chatbot function", async () => {
    render(<Events />);
    await screen.findByText("Login");

    await userEvent.type(screen.getByLabelText("Email"), "x");
    await userEvent.type(screen.getByLabelText("Password"), "x");
    await userEvent.click(screen.getByLabelText("Login Button"));
    await screen.findByText("Campus Events");

    await userEvent.click(screen.getByText("Try our chatbot!"));

    const textbox = screen.getByRole("textbox");
    await userEvent.type(textbox, "book basketball game");
    await userEvent.click(screen.getByLabelText("Submit"));

    const yes = await screen.findAllByText("Yes");
    expect(yes[0]).toBeVisible();
});
