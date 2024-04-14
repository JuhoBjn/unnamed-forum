import { render, screen } from '@testing-library/react';

import App from './App.jsx';

describe('The App component', () => {
  it('should display a React + Vite heading', () => {
    render(<App />);
    expect(screen.getByTestId('vite-react-heading')).toBeInTheDocument();
    expect(screen.getByTestId('vite-react-heading').innerHTML).toBe(
      'Vite + React'
    );
  });
});
