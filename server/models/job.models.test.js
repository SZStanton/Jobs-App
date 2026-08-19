import { describe, it, expect } from 'vitest';
// The server is commonjs, but a test file is loaded as an es module, so the
// model comes back as the default export
import Job from './job.models.js';

// validateSync runs the schema rules with no connection, so these pass from a
// clean clone with no database and no credentials
const valid = {
  description: 'Replace burst geyser',
  location: 'Block C, roof',
  priority: 'high',
};

async function errorsFor(overrides) {
  try {
    await new Job({ ...valid, ...overrides }).validate();
    return [];
  } catch (err) {
    return Object.keys(err.errors);
  }
}

describe('required fields', () => {
  it('accepts a job with the three required fields', async () => {
    expect(await errorsFor({})).toEqual([]);
  });

  for (const field of ['description', 'location', 'priority']) {
    it(`rejects a missing ${field}`, async () => {
      expect(await errorsFor({ [field]: undefined })).toContain(field);
    });

    it(`rejects an empty ${field}`, async () => {
      expect(await errorsFor({ [field]: '' })).toContain(field);
    });
  }
});

describe('priority', () => {
  for (const priority of ['low', 'medium', 'high']) {
    it(`accepts ${priority}`, async () => {
      expect(await errorsFor({ priority })).toEqual([]);
    });
  }

  for (const priority of ['urgent', 'High', 'HIGH', '1']) {
    it(`rejects ${priority}`, async () => {
      expect(await errorsFor({ priority })).toContain('priority');
    });
  }
});

describe('status', () => {
  it('defaults to submitted', () => {
    expect(new Job(valid).status).toBe('submitted');
  });

  for (const status of ['submitted', 'in-progress', 'completed']) {
    it(`accepts ${status}`, async () => {
      expect(await errorsFor({ status })).toEqual([]);
    });
  }

  for (const status of ['banana', 'Completed', 'done']) {
    it(`rejects ${status}`, async () => {
      expect(await errorsFor({ status })).toContain('status');
    });
  }
});

describe('archived', () => {
  it('defaults to false so new jobs are visible', () => {
    expect(new Job(valid).archived).toBe(false);
  });
});

describe('dueDate', () => {
  it('is optional and defaults to null', () => {
    expect(new Job(valid).dueDate).toBe(null);
  });

  it('accepts a date-only string', async () => {
    expect(await errorsFor({ dueDate: '2026-12-25' })).toEqual([]);
  });

  it('stores a date-only string as utc midnight', () => {
    const job = new Job({ ...valid, dueDate: '2026-12-25' });
    expect(job.dueDate.toISOString()).toBe('2026-12-25T00:00:00.000Z');
  });

  it('accepts the first day it allows', async () => {
    expect(await errorsFor({ dueDate: '2026-01-01' })).toEqual([]);
  });

  it('rejects a date before 2026', async () => {
    expect(await errorsFor({ dueDate: '2025-12-31' })).toContain('dueDate');
  });

  // The floor must not turn the optional field into a required one
  it('still allows no due date at all', async () => {
    expect(await errorsFor({ dueDate: null })).toEqual([]);
  });

  it('rejects text that is not a date', async () => {
    expect(await errorsFor({ dueDate: 'next tuesday' })).toContain('dueDate');
  });
});
