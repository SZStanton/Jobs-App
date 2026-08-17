import JobCard from './JobCard';

// Renders a JobCard for each job in list
function JobList({
  jobs,
  selectedJobs,
  handleCheckboxChange,
  updateJobStatus,
  archiveJob,
  restoreJob,
  deleteJob,
  emptyMessage,
}) {
  if (jobs.length === 0) {
    // No message means a load failed, and the error banner already says so
    return emptyMessage ? <p className="jobs-empty">{emptyMessage}</p> : null;
  }

  return (
    <div className="jobs-list">
      {/* Map each job to a card, keyed by job ID */}
      {jobs.map(job => (
        <JobCard
          key={job._id}
          job={job}
          selectedJobs={selectedJobs}
          handleCheckboxChange={handleCheckboxChange}
          updateJobStatus={updateJobStatus}
          archiveJob={archiveJob}
          restoreJob={restoreJob}
          deleteJob={deleteJob}
        />
      ))}
    </div>
  );
}

export default JobList;
