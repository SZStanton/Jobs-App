// A due date is a date-only value, stored as UTC midnight. Both functions here
// have to respect that or anyone behind UTC sees the wrong day

// Overdue is worked out on the fly rather than stored, so it stays true
// without anything having to run on a schedule
export function isOverdue(job) {
  if (!job.dueDate || job.archived || job.status === 'completed') return false;

  // Turn today into the same UTC-midnight shape the due date is stored in, so
  // only which day it is locally matters, never the offset
  const now = new Date();
  const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return new Date(job.dueDate).getTime() < todayUTC;
}

export function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    // Read back in UTC for the same reason it is stored that way
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
