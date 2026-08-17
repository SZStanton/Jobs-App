import { describe, it, expect, vi, afterEach } from 'vitest';
import { isOverdue, formatDate } from './dates';

const base = { description: 'x', location: 'y', priority: 'high' };

// A due date is stored as UTC midnight, so these are written the same way
const day = d => `2026-08-${d}T00:00:00.000Z`;

// Pretend it is the 18th, at an hour that would push a naive local-midnight
// comparison onto the wrong day for anyone behind UTC
function pretendToday(iso) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(iso));
}

afterEach(() => {
  vi.useRealTimers();
});

// If the pin in vitest.config.js ever goes, these tests still pass but stop
// proving anything, because the logic is correct at UTC+2 either way
it('runs behind utc, or the tests below are worthless', () => {
  expect(new Date('2026-08-18T12:00:00Z').getTimezoneOffset()).toBeGreaterThan(
    0,
  );
});

describe('isOverdue', () => {
  it('is false when there is no due date', () => {
    expect(isOverdue({ ...base })).toBe(false);
  });

  it('is false for a job due today', () => {
    pretendToday('2026-08-18T09:00:00Z');
    expect(isOverdue({ ...base, dueDate: day(18) })).toBe(false);
  });

  it('is true for a job due yesterday', () => {
    pretendToday('2026-08-18T09:00:00Z');
    expect(isOverdue({ ...base, dueDate: day(17) })).toBe(true);
  });

  it('is false for a job due tomorrow', () => {
    pretendToday('2026-08-18T09:00:00Z');
    expect(isOverdue({ ...base, dueDate: day(19) })).toBe(false);
  });

  // The bug this replaced fired late in the day at a negative utc offset
  it('is still false for a job due today late in the evening', () => {
    pretendToday('2026-08-18T23:30:00Z');
    expect(isOverdue({ ...base, dueDate: day(18) })).toBe(false);
  });

  it('is false once the job is completed, however late it is', () => {
    pretendToday('2026-08-18T09:00:00Z');
    expect(isOverdue({ ...base, dueDate: day(1), status: 'completed' })).toBe(
      false,
    );
  });

  // Archiving removes the status control, so without this an archived job
  // would wear a red badge forever
  it('is false once the job is archived, even if not completed', () => {
    pretendToday('2026-08-18T09:00:00Z');
    expect(
      isOverdue({
        ...base,
        dueDate: day(1),
        status: 'submitted',
        archived: true,
      }),
    ).toBe(false);
  });
});

describe('formatDate', () => {
  it('shows the stored day, not the day before', () => {
    expect(formatDate(day(18))).toContain('18');
  });

  it('does not drift for a date at the start of a month', () => {
    expect(formatDate('2026-09-01T00:00:00.000Z')).toContain('1');
  });
});
