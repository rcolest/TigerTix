import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Events from './Events';

test('Site loads', async () => {
    render(<Events />);
    // This line is needed to ensure the "loading" screen is gone
    await screen.findByText("Login");

    const speechButton = screen.getByText("Login");
    expect(speechButton).toBeVisible();
});

test('Switch to register', async () => {
    render(<Events />);
    await screen.findByText("Login");

    const register = screen.getByText("Register");
    await userEvent.click(register);

    const switchButton = screen.getByText(`Already have an account?`);
    expect(switchButton).toBeVisible();
});

test('Logging in', async () => {
    render(<Events />);
    await screen.findByText("Login");

    const emailLogin = screen.getByLabelText("Email");
    await userEvent.click(emailLogin);
    await userEvent.keyboard('test-email@example.com');
    const passLogin = screen.getByLabelText("Password");
    await userEvent.click(passLogin);
    await userEvent.keyboard('test-password');

    const loginButton = screen.getByLabelText("Login Button");
    await userEvent.click(loginButton);
    await screen.findByText("Campus Events");

    const header = screen.getByText("Campus Events");
    expect(header).toBeVisible();
});

test('Confirmation', async () => {
    render(<Events />);
    await screen.findByText("Login");

    const ticketOptions = await screen.findAllByText("Buy Ticket");
    await userEvent.click(ticketOptions[0]);
    const confirmbutton = screen.getAllByText('Yes');

    expect(confirmbutton[0]).toBeVisible();
});

test('Book ticket', async () => {
    render(<Events />);
    await screen.findByText("Login");

    const res = await fetch("http://localhost:6001/api/events");
    const eventData = await res.json();
    const expectedTickets = eventData[0].num_tickets;

    const ticketOptions = await screen.findAllByText("Buy Ticket");
    await userEvent.click(ticketOptions[0]);
    const confirmbutton = screen.getAllByText('Yes');
    await userEvent.click(confirmbutton[0]);

    const newAmount = screen.getByText(`Tickets Available: ${expectedTickets}`);
    expect(newAmount).toBeInTheDocument();
});

test('Chatbot function', async () => {
    render(<Events />);
    await screen.findByText("Login");

    const chatbotButton = screen.getByText("Try our chatbot!");
    await userEvent.click(chatbotButton);
    const chatbotText = screen.getByRole('textbox');
    await userEvent.click(chatbotText);
    await userEvent.keyboard('book basketball game');
    await userEvent.click(screen.getByLabelText('Submit'));

    const message = screen.getAllByText('Yes');
    expect(message[0]).toBeVisible();
});