import JobCard from './JobCard';

// Renders a JobCard for each job in list
function JobList({
  jobs,
  selectedJobs,
  handleCheckboxChange,
  updateJobStatus,
  archiveJob,
}) {
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
