import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Events from './Events';

test('Site loads', async () => {
    render(<Events />);
    // This line is needed to ensure the "loading" screen is gone
    await screen.findByText("Campus Events");

    const chatbotButton = screen.getByText("🎤 Speak");
    expect(chatbotButton).toBeVisible();
});

test('Confirmation', async () => {
    const user = userEvent.setup();
    render(<Events />);
    await screen.findByText("Campus Events");

    const ticketOptions = await screen.findAllByText("Buy Ticket");
    await user.click(ticketOptions[0]);
    const confirmbutton = screen.getAllByText('Yes');

    expect(confirmbutton[0]).toBeVisible();
});