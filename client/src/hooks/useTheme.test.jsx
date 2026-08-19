import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTheme } from './useTheme';

function Probe() {
  const [theme, toggleTheme] = useTheme();
  return <button onClick={toggleTheme}>{theme}</button>;
}

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

describe('useTheme', () => {
  it('falls back to light when nothing is stored and no dark preference', () => {
    render(<Probe />);
    expect(screen.getByRole('button').textContent).toBe('light');
  });

  it('puts the theme on the root element', () => {
    render(<Probe />);
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('toggles to dark and back', async () => {
    const user = userEvent.setup();
    render(<Probe />);
    const button = screen.getByRole('button');

    await act(() => user.click(button));
    expect(button.textContent).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');

    await act(() => user.click(button));
    expect(button.textContent).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('remembers the choice for the next visit', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Probe />);

    await act(() => user.click(screen.getByRole('button')));
    expect(localStorage.getItem('jobs-app-theme')).toBe('dark');

    unmount();
    render(<Probe />);
    expect(screen.getByRole('button').textContent).toBe('dark');
  });

  // Storing the inferred default would freeze it, and a later os switch to
  // dark would be ignored forever
  it('stores nothing until the user actually chooses', () => {
    render(<Probe />);
    expect(localStorage.getItem('jobs-app-theme')).toBe(null);
  });

  it('stores the choice once toggled', async () => {
    const user = userEvent.setup();
    render(<Probe />);

    await act(() => user.click(screen.getByRole('button')));

    expect(localStorage.getItem('jobs-app-theme')).toBe('dark');
  });

  it('prefers a stored choice over the system setting', () => {
    localStorage.setItem('jobs-app-theme', 'dark');
    render(<Probe />);
    expect(screen.getByRole('button').textContent).toBe('dark');
  });
});
