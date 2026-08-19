import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Job from './job.models.js';

// The earliest allowed due date is written twice, once in the schema and once
// as the date input's 'min'. Relaxing one alone lets the browser accept a date
// the api rejects, with a raw mongoose error and nothing failing
describe('the due date floor', () => {
  const form = readFileSync(
    join(import.meta.dirname, '../../client/src/components/JobForm.jsx'),
    'utf8',
  );

  it('is the same date in the schema and in the form', () => {
    const schemaFloor = Job.schema.path('dueDate').options.min[0];
    const formFloor = form.match(/min="(\d{4}-\d{2}-\d{2})"/)?.[1];

    expect(formFloor).toBeDefined();
    expect(schemaFloor.toISOString().slice(0, 10)).toBe(formFloor);
  });
});
