import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

// Components
import JobForm from './components/JobForm';
import JobList from './components/JobList';
import FilterJobs from './components/FilterJobs';
import BatchUpdate from './components/BatchUpdate';

// Base URL for all API requests. Falls back to the local server so a fresh
// clone runs with no .env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// The api sends { error: 'message' }, but a dead server never gets that far
function readError(error, fallback) {
  return error.response?.data?.error || error.message || fallback;
}

function App() {
  // Full Job list
  const [jobs, setJobs] = useState([]);
  // Active filter, default 'all'
  const [filterStatus, setFilterStatus] = useState('all');
  // Job IDs checked for batch action
  const [selectedJobs, setSelectedJobs] = useState([]);
  // Status applied on batch update
  const [batchStatus, setBatchStatus] = useState('submitted');
  // Whatever went wrong last, shown at the top of the page
  const [error, setError] = useState(null);
  // Only covers the first load, not every refetch
  const [loading, setLoading] = useState(true);
  // Archived jobs live behind a toggle, kept separate from the main list
  const [archivedJobs, setArchivedJobs] = useState([]);
  const [showArchived, setShowArchived] = useState(false);

  // Fetch all jobs - GET
  const fetchJobs = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/jobs`);
      setJobs(data);
      // Drop selections whose job has been archived or deleted elsewhere,
      // otherwise a batch update targets ids that are no longer on screen
      setSelectedJobs(prev => prev.filter(id => data.some(j => j._id === id)));
      setError(null);
    } catch (err) {
      setError(readError(err, 'Could not load jobs'));
    }
  };

  // Create new job - POST
  const createJob = async jobData => {
    try {
      await axios.post(`${API_URL}/jobs`, jobData);
      await fetchJobs();
    } catch (err) {
      setError(readError(err, 'Could not create job'));
    }
  };

  // Update single job status - PUT
  const updateJobStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/jobs/${id}`, { status });
      await fetchJobs();
    } catch (err) {
      setError(readError(err, 'Could not update job'));
    }
  };

  // Fetch archived jobs - GET
  const fetchArchivedJobs = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/jobs/archived`);
      setArchivedJobs(data);
      setError(null);
    } catch (err) {
      setError(readError(err, 'Could not load archived jobs'));
    }
  };

  // Both lists change whenever a job moves between them. In parallel, since
  // waking a sleeping server twice in a row is a long wait
  const refreshBothLists = async () => {
    await Promise.all([fetchJobs(), fetchArchivedJobs()]);
  };

  // Archive single job - PUT
  const archiveJob = async id => {
    try {
      await axios.put(`${API_URL}/jobs/${id}/archive`);
      await refreshBothLists();
    } catch (err) {
      setError(readError(err, 'Could not archive job'));
    }
  };

  // Restore a job out of the archive - PUT
  const restoreJob = async id => {
    try {
      await axios.put(`${API_URL}/jobs/${id}/restore`);
      await refreshBothLists();
    } catch (err) {
      setError(readError(err, 'Could not restore job'));
    }
  };

  // Delete a job for good - DELETE
  const deleteJob = async id => {
    if (
      !window.confirm('Delete this job permanently? This cannot be undone.')
    ) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/jobs/${id}`);
      await fetchArchivedJobs();
    } catch (err) {
      setError(readError(err, 'Could not delete job'));
    }
  };

  // Handle checkbox selection
  const handleCheckboxChange = id => {
    setSelectedJobs(prev =>
      prev.includes(id) ? prev.filter(jobId => jobId !== id) : [...prev, id],
    );
  };

  // Batch update selected jobs - PUT
  const batchUpdateJobs = async () => {
    try {
      await axios.put(`${API_URL}/jobs/batch/update`, {
        ids: selectedJobs,
        status: batchStatus,
      });

      setSelectedJobs([]);
      await fetchJobs();
    } catch (err) {
      setError(readError(err, 'Could not update the selected jobs'));
    }
  };

  // Filter jobs by status, default 'all'
  const filteredJobs =
    filterStatus === 'all'
      ? jobs
      : jobs.filter(job => job.status === filterStatus);

  // Nothing to show can mean two different things, so say which
  const emptyMessage =
    jobs.length === 0
      ? 'No jobs yet. Submit one above to get started.'
      : `No jobs with the status "${filterStatus}".`;

  const archivedEmptyMessage = 'Nothing archived yet.';

  // Load jobs
  useEffect(() => {
    const loadJobs = async () => {
      await refreshBothLists();
      setLoading(false);
    };
    loadJobs();
    // Mount only. The fetchers are recreated every render, so listing them
    // here would refetch forever
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container">
      <h1>Maintenance Management App</h1>

      {error && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}

      <button
        className="view-toggle"
        onClick={() => setShowArchived(prev => !prev)}
      >
        {showArchived
          ? 'Back to Active Jobs'
          : `View Archive (${archivedJobs.length})`}
      </button>

      {!showArchived && (
        <>
          <JobForm createJob={createJob} />

          <FilterJobs
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />

          <BatchUpdate
            batchStatus={batchStatus}
            setBatchStatus={setBatchStatus}
            batchUpdateJobs={batchUpdateJobs}
            selectedCount={selectedJobs.length}
          />
        </>
      )}

      {loading ? (
        // The free tier sleeps after 15 minutes, so the first load can be slow
        <p className="loading">
          Loading jobs. Waking the server can take a minute.
        </p>
      ) : (
        <JobList
          jobs={showArchived ? archivedJobs : filteredJobs}
          selectedJobs={selectedJobs}
          handleCheckboxChange={handleCheckboxChange}
          updateJobStatus={updateJobStatus}
          archiveJob={archiveJob}
          restoreJob={restoreJob}
          deleteJob={deleteJob}
          emptyMessage={showArchived ? archivedEmptyMessage : emptyMessage}
        />
      )}
    </div>
  );
}

export default App;
