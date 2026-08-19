import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JobCard from './JobCard';

const job = {
  _id: 'a1',
  description: 'Replace burst geyser',
  location: 'Block C, roof',
  priority: 'high',
  status: 'submitted',
  archived: false,
};

function renderCard(overrides = {}, props = {}) {
  const handlers = {
    selectedJobs: [],
    handleCheckboxChange: vi.fn(),
    updateJobStatus: vi.fn(),
    archiveJob: vi.fn(),
    restoreJob: vi.fn(),
    deleteJob: vi.fn(),
    ...props,
  };
  render(<JobCard job={{ ...job, ...overrides }} {...handlers} />);
  return handlers;
}

describe('an active job', () => {
  it('shows the job details', () => {
    renderCard();
    expect(screen.getByText('Replace burst geyser')).toBeTruthy();
    expect(screen.getByText('Block C, roof')).toBeTruthy();
  });

  // Only a real click exercises the label being wired to the checkbox
  it('toggles selection when the label is clicked', async () => {
    const user = userEvent.setup();
    const { handleCheckboxChange } = renderCard();

    await user.click(screen.getByLabelText('Select'));

    expect(handleCheckboxChange).toHaveBeenCalledWith('a1');
  });

  it('archives on button click', async () => {
    const user = userEvent.setup();
    const { archiveJob } = renderCard();

    await user.click(screen.getByRole('button', { name: 'Archive Job' }));

    expect(archiveJob).toHaveBeenCalledWith('a1');
  });

  it('has no restore or delete buttons', () => {
    renderCard();
    expect(screen.queryByRole('button', { name: 'Restore Job' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Delete Forever' })).toBeNull();
  });
});

describe('an archived job', () => {
  it('offers restore and delete instead of the status controls', () => {
    renderCard({ archived: true });

    expect(screen.getByRole('button', { name: 'Restore Job' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Delete Forever' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Archive Job' })).toBeNull();
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.queryByLabelText('Select')).toBeNull();
  });
});

describe('due dates', () => {
  // The label is a <dt> reading "Due", with no colon. Matching /Due:/ passed
  // whatever the card rendered
  it('shows no due line when there is no due date', () => {
    renderCard();
    expect(screen.queryByText('Due')).toBeNull();
  });

  it('shows the due line when there is one', () => {
    renderCard({ dueDate: '2099-01-01T00:00:00.000Z' });
    expect(screen.getByText('Due')).toBeTruthy();
  });

  it('flags an overdue job', () => {
    renderCard({ dueDate: '2020-01-01T00:00:00.000Z' });
    expect(screen.getByText('Overdue')).toBeTruthy();
  });

  it('does not flag a job due far in the future', () => {
    renderCard({ dueDate: '2099-01-01T00:00:00.000Z' });
    expect(screen.queryByText('Overdue')).toBeNull();
  });
});
