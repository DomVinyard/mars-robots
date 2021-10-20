import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import useImage from 'react-use-image';
jest.mock('react-use-image');

// Ensure the loading text displays while the image is loading
test('loading', async () => {
  (useImage as any).mockImplementation(() => ({ loaded: false }));
  render(<App />);
  const loadingElement = screen.getByText(/establishing connection/i);
  expect(loadingElement).toBeInTheDocument();
});

// Ensure the app runs after the image loads
test('app', async () => {
  (useImage as any).mockImplementation(() => ({ loaded: true }));
  render(<App />);
  const sendButton = screen.getByText(/Send/i);
  expect(sendButton).toBeInTheDocument();
  expect(screen.getByTestId(/not-processing/i)).toBeInTheDocument();

  // Click the send button and ensure the app starts processing
  sendButton.click();
  await waitFor(() => {
    expect(screen.getByTestId(/is-processing/i)).toBeInTheDocument();
  });
});
