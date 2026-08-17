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
  const details = (
    <>
      <h2>{job.description}</h2>
      <p>
        <strong>Location:</strong> {job.location}
      </p>
      <p>
        <strong>Priority:</strong> {job.priority}
      </p>
      <p>
        <strong>Status:</strong> {job.status}
      </p>
    </>
  );

  if (job.archived) {
    return (
      <div className="job-card">
        {details}

        <button onClick={() => restoreJob(job._id)}>Restore Job</button>
        <button onClick={() => deleteJob(job._id)}>Delete Forever</button>
      </div>
    );
  }

  return (
    <div className="job-card">
      {/* Checkbox for batch selection */}
      <label>
        <input
          type="checkbox"
          checked={selectedJobs.includes(job._id)}
          onChange={() => handleCheckboxChange(job._id)}
        />
        Select
      </label>

      {details}

      {/* Update status of job*/}
      <select
        value={job.status}
        onChange={e => updateJobStatus(job._id, e.target.value)}
      >
        <option value="submitted">Submitted</option>
        <option value="in-progress">In-Progress</option>
        <option value="completed">Completed</option>
      </select>

      {/* Archive job*/}
      <button onClick={() => archiveJob(job._id)}>Archive Job</button>
    </div>
  );
}

export default JobCard;
