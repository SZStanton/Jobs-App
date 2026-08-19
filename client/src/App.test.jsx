import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import App from './App';

vi.mock('axios');

const jobs = [
  {
    _id: 'a1',
    description: 'Replace burst geyser',
    location: 'Block C, roof',
    priority: 'high',
    status: 'submitted',
    archived: false,
  },
  {
    _id: 'a2',
    description: 'Service generator',
    location: 'Basement plant room',
    priority: 'medium',
    status: 'submitted',
    archived: false,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  axios.get.mockImplementation(url =>
    Promise.resolve({ data: url.endsWith('/archived') ? [] : jobs }),
  );
  axios.put.mockResolvedValue({ data: {} });
});

async function renderApp() {
  render(<App />);
  await screen.findByText('Replace burst geyser');
}

describe('batch selection', () => {
  it('counts selected jobs', async () => {
    const user = userEvent.setup();
    await renderApp();

    expect(
      screen.getByRole('button', { name: 'Update Selected Jobs' }).disabled,
    ).toBe(true);

    await user.click(screen.getAllByLabelText('Select')[0]);

    expect(
      screen.getByRole('button', { name: 'Update 1 Selected' }).disabled,
    ).toBe(false);
  });

  // This one reached main three times, via archiving, filtering and search.
  // A hidden job stays out of a batch update
  it('ignores a selected job once a search hides it', async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(screen.getAllByLabelText('Select')[0]);
    await user.type(screen.getByLabelText('Search'), 'generator');

    await waitFor(() => {
      expect(screen.queryByText('Replace burst geyser')).toBeNull();
    });
    expect(
      screen.getByRole('button', { name: 'Update Selected Jobs' }).disabled,
    ).toBe(true);
  });

  it('sends only the visible selection to the server', async () => {
    const user = userEvent.setup();
    await renderApp();

    // Select both, then hide one of them
    await user.click(screen.getAllByLabelText('Select')[0]);
    await user.click(screen.getAllByLabelText('Select')[1]);
    await user.type(screen.getByLabelText('Search'), 'generator');

    await user.click(screen.getByRole('button', { name: 'Update 1 Selected' }));

    const [, body] = axios.put.mock.calls.find(([url]) =>
      url.includes('batch/update'),
    );
    expect(body.ids).toEqual(['a2']);
  });

  it('brings the selection back when the search is cleared', async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(screen.getAllByLabelText('Select')[0]);
    const search = screen.getByLabelText('Search');
    await user.type(search, 'generator');
    await user.clear(search);

    expect(
      await screen.findByRole('button', { name: 'Update 1 Selected' }),
    ).toBeTruthy();
  });

  it('keeps a hidden job selected after a batch update', async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(screen.getAllByLabelText('Select')[0]);
    await user.click(screen.getAllByLabelText('Select')[1]);
    await user.type(screen.getByLabelText('Search'), 'generator');
    await user.click(screen.getByRole('button', { name: 'Update 1 Selected' }));

    // The hidden job was never updated, so it keeps its tick
    await user.clear(screen.getByLabelText('Search'));
    expect(
      await screen.findByRole('button', { name: 'Update 1 Selected' }),
    ).toBeTruthy();
  });
});

describe('the job form', () => {
  it('clears once the job is saved', async () => {
    const user = userEvent.setup();
    axios.post.mockResolvedValue({ data: {} });
    await renderApp();

    await user.type(screen.getByLabelText('Description'), 'Fix the lift');
    await user.type(screen.getByLabelText('Location'), 'Lobby');
    await user.selectOptions(screen.getByLabelText('Priority'), 'high');
    await user.click(screen.getByRole('button', { name: 'Submit Job' }));

    expect(screen.getByLabelText('Description').value).toBe('');
  });

  // A sleeping server would otherwise take the whole job with nothing to retry
  it('keeps what was typed when saving fails', async () => {
    const user = userEvent.setup();
    axios.post.mockRejectedValue(new Error('Network Error'));
    await renderApp();

    await user.type(screen.getByLabelText('Description'), 'Fix the lift');
    await user.type(screen.getByLabelText('Location'), 'Lobby');
    await user.selectOptions(screen.getByLabelText('Priority'), 'high');
    await user.click(screen.getByRole('button', { name: 'Submit Job' }));

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByLabelText('Description').value).toBe('Fix the lift');
  });
});

describe('search', () => {
  it('matches on location as well as description', async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.type(screen.getByLabelText('Search'), 'basement');

    await waitFor(() => {
      expect(screen.queryByText('Replace burst geyser')).toBeNull();
    });
    expect(screen.getByText('Service generator')).toBeTruthy();
  });

  it('says which search found nothing', async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.type(screen.getByLabelText('Search'), 'zzz');

    expect(await screen.findByText('No jobs match "zzz".')).toBeTruthy();
  });

  it('names both controls when a status filter is also narrowing', async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.selectOptions(screen.getByLabelText('Status'), 'completed');
    await user.type(screen.getByLabelText('Search'), 'geyser');

    expect(
      await screen.findByText('No "completed" jobs match "geyser".'),
    ).toBeTruthy();
  });
});

describe('loading and errors', () => {
  it('shows an error when jobs cannot be loaded', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'));
    render(<App />);

    expect(await screen.findByRole('alert')).toBeTruthy();
  });

  it('does not claim the list is empty when the load failed', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'));
    render(<App />);

    await screen.findByRole('alert');
    expect(screen.queryByText(/No jobs yet/)).toBeNull();
  });
});
