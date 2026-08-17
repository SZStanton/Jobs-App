import JobCard from './JobCard';

// Renders a JobCard for each job in list
function JobList({
  jobs,
  selectedJobs,
  handleCheckboxChange,
  updateJobStatus,
  archiveJob,
  emptyMessage,
}) {
  if (jobs.length === 0) {
    return <p className="jobs-empty">{emptyMessage}</p>;
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
        />
      ))}
    </div>
  );
}

export default JobList;
