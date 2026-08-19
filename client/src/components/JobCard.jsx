import { isOverdue, formatDate } from '../utils/dates';

// Single job card. Archived jobs get restore and delete instead of the
// status controls, since nothing about them should still be editable
function JobCard({
  job,
  selectedJobs,
  handleCheckboxChange,
  updateJobStatus,
  archiveJob,
  restoreJob,
  deleteJob,
}) {
  const overdue = isOverdue(job);

  const details = (
    <dl className="job-meta">
      <dt>Location</dt>
      <dd>{job.location}</dd>

      <dt>Priority</dt>
      <dd>
        <span className={`pill pill-${job.priority}`}>{job.priority}</span>
      </dd>

      <dt>Status</dt>
      <dd>
        <span className={`pill pill-${job.status}`}>{job.status}</span>
      </dd>

      {job.dueDate && (
        <>
          <dt>Due</dt>
          <dd>
            {formatDate(job.dueDate)}
            {overdue && <span className="badge-overdue">Overdue</span>}
          </dd>
        </>
      )}
    </dl>
  );

  if (job.archived) {
    return (
      <div className="job-card">
        <div className="job-card-head">
          <h2>{job.description}</h2>
        </div>

        {details}

        <div className="job-card-actions">
          <button onClick={() => restoreJob(job._id)}>Restore Job</button>
          <button onClick={() => deleteJob(job._id)}>Delete Forever</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`job-card${overdue ? ' is-overdue' : ''}`}>
      <div className="job-card-head">
        <h2>{job.description}</h2>

        {/* Checkbox for batch selection */}
        <label className="select-label">
          <input
            type="checkbox"
            checked={selectedJobs.includes(job._id)}
            onChange={() => handleCheckboxChange(job._id)}
          />
          Select
        </label>
      </div>

      {details}

      <div className="job-card-actions">
        {/* Update status of job*/}
        <label className="field-label">
          Change status
          <select
            value={job.status}
            onChange={e => updateJobStatus(job._id, e.target.value)}
          >
            <option value="submitted">Submitted</option>
            <option value="in-progress">In-Progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>

        {/* Archive job*/}
        <button onClick={() => archiveJob(job._id)}>Archive Job</button>
      </div>
    </div>
  );
}

export default JobCard;
