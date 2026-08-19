import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

// Components
import JobForm from './components/JobForm';
import JobList from './components/JobList';
import FilterJobs from './components/FilterJobs';
import BatchUpdate from './components/BatchUpdate';
import ThemeToggle from './components/ThemeToggle';
import { useTheme } from './hooks/useTheme';

// Base URL for all API requests. Falls back to the local server so a fresh
// clone runs with no .env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// The api sends { error: 'message' }, but a dead server never gets that far
function readError(error, fallback) {
  return error.response?.data?.error || error.message || fallback;
}

function App() {
  // Light or dark, remembered between visits
  const [theme, toggleTheme] = useTheme();
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

  // Create new job - POST. Reports back so the form knows whether it is safe
  // to clear what the user typed
  const createJob = async jobData => {
    setError(null);
    try {
      await axios.post(`${API_URL}/jobs`, jobData);
      await fetchJobs();
      return true;
    } catch (err) {
      setError(readError(err, 'Could not create job'));
      return false;
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

  // Archive and restore are the same write with a different verb - PUT
  const moveJob = async (id, action) => {
    setError(null);
    try {
      await axios.put(`${API_URL}/jobs/${id}/${action}`);
      await refreshBothLists();
    } catch (err) {
      setError(readError(err, `Could not ${action} job`));
    }
  };

  const archiveJob = id => moveJob(id, 'archive');
  const restoreJob = id => moveJob(id, 'restore');

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

      // Only what was updated gets cleared. A job hidden by the filter was
      // left alone, so it keeps its tick for when it comes back
      setSelectedJobs(prev =>
        prev.filter(id => !visibleSelectedIds.includes(id)),
      );
      await fetchJobs();
    } catch (err) {
      setError(readError(err, 'Could not update the selected jobs'));
    }
  };

  // Status and keyword narrow the list together, both in memory. The list is
  // small enough that a round trip per keystroke would be the slower option
  const trimmed = search.trim();
  const term = trimmed.toLowerCase();
  const filteredJobs = jobs.filter(job => {
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    const matchesTerm =
      term === '' ||
      job.description.toLowerCase().includes(term) ||
      job.location.toLowerCase().includes(term);

    return matchesStatus && matchesTerm;
  });

  // Filtering hides jobs without deselecting them, so a batch acts on the
  // visible ones only
  const visibleSelectedIds = selectedJobs.filter(id =>
    filteredJobs.some(job => job._id === id),
  );

  // An empty list means several different things, so the message says which
  const emptyMessage = (() => {
    // A failed load empties the list too, and the banner already covers that.
    // Tied to the whole list rather than the filtered view, so a search that
    // matches nothing still explains itself while an error is showing
    const loaded = showArchived ? archivedJobs : jobs;
    if (loaded.length === 0 && error) return null;

    if (showArchived) return 'Nothing archived yet.';
    if (jobs.length === 0) {
      return 'No jobs yet. Submit one above to get started.';
    }
    // Both can be narrowing at once, so the message names them both
    if (term && filterStatus !== 'all') {
      return `No "${filterStatus}" jobs match "${trimmed}".`;
    }
    if (term) return `No jobs match "${trimmed}".`;
    return `No jobs with the status "${filterStatus}".`;
  })();

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
      <header className="app-header">
        <div>
          <h1>Maintenance Jobs</h1>
          <p>{showArchived ? 'Archive' : 'Active work'}</p>
        </div>

        <div className="header-actions">
          <button onClick={() => setShowArchived(prev => !prev)}>
            {showArchived
              ? 'Back to Active Jobs'
              : `View Archive (${archivedJobs.length})`}
          </button>

          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </header>

      {error && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}

      {!showArchived && (
        <>
          <JobForm createJob={createJob} />

          <div className="controls-row">
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
          </div>
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
          emptyMessage={emptyMessage}
        />
      )}
    </div>
  );
}

export default App;
