// Single job card with status controls
function JobCard({
  job,
  selectedJobs,
  handleCheckboxChange,
  updateJobStatus,
  archiveJob,
}) {
  return (
    <div className="job-card">
      {/* Checkbox for batch selection */}
      <input
        type="checkbox"
        checked={selectedJobs.includes(job._id)}
        onChange={() => handleCheckboxChange(job._id)}
      />

      <h2>{job.description}</h2>
      <p>
        <strong>Location</strong> {job.location}
      </p>
      <p>
        <strong>Priority</strong> {job.priority}
      </p>
      <p>
        <strong>Status:</strong> {job.status}
      </p>

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
