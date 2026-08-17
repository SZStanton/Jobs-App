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
  // Keyword typed into the search box
  const [search, setSearch] = useState('');
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
    } catch (err) {
      setError(readError(err, 'Could not load jobs'));
    }
  };

  // Create new job - POST
  const createJob = async jobData => {
    setError(null);
    try {
      await axios.post(`${API_URL}/jobs`, jobData);
      await fetchJobs();
    } catch (err) {
      setError(readError(err, 'Could not create job'));
    }
  };

  // Update single job status - PUT
  const updateJobStatus = async (id, status) => {
    setError(null);
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
    setError(null);
    try {
      await axios.put(`${API_URL}/jobs/${id}/archive`);
      await refreshBothLists();
    } catch (err) {
      setError(readError(err, 'Could not archive job'));
    }
  };

  // Restore a job out of the archive - PUT
  const restoreJob = async id => {
    setError(null);
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

    setError(null);
    try {
      await axios.delete(`${API_URL}/jobs/${id}`);
    } catch (err) {
      setError(readError(err, 'Could not delete job'));
    } finally {
      // Refetch either way. A failed delete usually means someone else got
      // there first, so the stale card needs clearing off the screen
      await fetchArchivedJobs();
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
    setError(null);
    try {
      await axios.put(`${API_URL}/jobs/batch/update`, {
        ids: visibleSelectedIds,
        status: batchStatus,
      });

      setSelectedJobs([]);
      await fetchJobs();
    } catch (err) {
      setError(readError(err, 'Could not update the selected jobs'));
    }
  };

  // Status and keyword narrow the list together, both in memory. The list is
  // small enough that a round trip per keystroke would be the slower option
  const term = search.trim().toLowerCase();
  const filteredJobs = jobs.filter(job => {
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    const matchesTerm =
      term === '' ||
      job.description.toLowerCase().includes(term) ||
      job.location.toLowerCase().includes(term);

    return matchesStatus && matchesTerm;
  });

  // Only act on what is actually on screen. Filtering hides jobs without
  // deselecting them, and a batch must not touch anything the user cannot see
  const visibleSelectedIds = selectedJobs.filter(id =>
    filteredJobs.some(job => job._id === id),
  );

  // An empty list means several different things, so say which one
  function activeEmptyMessage() {
    if (jobs.length === 0) {
      // A failed first load leaves this empty too, and the banner covers that.
      // Checked here rather than up front, since a failed archive or delete
      // also sets error and must not blank out the filter message
      return error ? null : 'No jobs yet. Submit one above to get started.';
    }
    // Both can be narrowing at once, and blaming only one of them is a lie
    if (term && filterStatus !== 'all') {
      return `No "${filterStatus}" jobs match "${search.trim()}".`;
    }
    if (term) return `No jobs match "${search.trim()}".`;
    return `No jobs with the status "${filterStatus}".`;
  }

  const emptyMessage = activeEmptyMessage();

  const archivedEmptyMessage = error ? null : 'Nothing archived yet.';

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
            search={search}
            setSearch={setSearch}
          />

          <BatchUpdate
            batchStatus={batchStatus}
            setBatchStatus={setBatchStatus}
            batchUpdateJobs={batchUpdateJobs}
            selectedCount={visibleSelectedIds.length}
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
