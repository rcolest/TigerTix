import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Events from './Events';

test('Site loads', async () => {
    render(<Events />);
    // This line is needed to ensure the "loading" screen is gone
    await screen.findByText("Campus Events");

    const speechButton = screen.getByText("🎤 Speak");
    expect(speechButton).toBeVisible();
});

test('Confirmation', async () => {
    render(<Events />);
    await screen.findByText("Campus Events");

    const ticketOptions = await screen.findAllByText("Buy Ticket");
    await userEvent.click(ticketOptions[0]);
    const confirmbutton = screen.getAllByText('Yes');

    expect(confirmbutton[0]).toBeVisible();
});

test('Chatbot function', async () => {
    render(<Events />);
    await screen.findByText("Campus Events");

    const chatbotButton = screen.getByText("Try our chatbot!");
    await userEvent.click(chatbotButton);
    const chatbotText = screen.getByRole('textbox');
    await userEvent.click(chatbotText);
    await userEvent.keyboard('book basketball game');
    await userEvent.click(screen.getByRole('button', {name: 'Submit'}));

    const message = screen.getAllByText('Yes');
    expect(message[0]).toBeVisible();
});
