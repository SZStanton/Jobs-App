import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

// Components
import JobForm from './components/JobForm';
import JobList from './components/JobList';
import FilterJobs from './components/FilterJobs';
import BatchUpdate from './components/BatchUpdate';

// Base URL for all API requests
const API_URL = 'http://localhost:3000';

function App() {
  // Full Job list
  const [jobs, setJobs] = useState([]);
  // Active filter, default 'all'
  const [filterStatus, setFilterStatus] = useState('all');
  // Job IDs checked for batch action
  const [selectedJobs, setSelectedJobs] = useState([]);
  // Status applied on batch update
  const [batchStatus, setBatchStatus] = useState('submitted');

  // Fetch all jobs - GET
  const fetchJobs = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/jobs`);
      setJobs(data);
    } catch (error) {
      console.log(error);
    }
  };

  // Create new job - POST
  const createJob = async jobData => {
    try {
      await axios.post(`${API_URL}/jobs`, jobData);
      await fetchJobs();
    } catch (error) {
      console.log(error);
    }
  };

  // Update single job status - PUT
  const updateJobStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/jobs/${id}`, { status });
      await fetchJobs();
    } catch (error) {
      console.log(error);
    }
  };

  // Archive single job - PUT
  const archiveJob = async id => {
    try {
      await axios.put(`${API_URL}/jobs/${id}/archive`);
      await fetchJobs();
    } catch (error) {
      console.log(error);
    }
  };

  // Handle checkbox selection
  const handleCheckboxChange = id => {
    if (selectedJobs.includes(id)) {
      setSelectedJobs(selectedJobs.filter(jobId => jobId !== id));
    } else {
      setSelectedJobs([...selectedJobs, id]);
    }
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
    } catch (error) {
      console.log(error);
    }
  };

  // Filter jobs by status, default 'all'
  const filteredJobs =
    filterStatus === 'all'
      ? jobs
      : jobs.filter(job => job.status === filterStatus);

  // Load jobs
  useEffect(() => {
    const loadJobs = async () => {
      await fetchJobs();
    };
    loadJobs();
  }, []);

  return (
    <div className="container">
      <h1>Maintenance Management App</h1>

      <JobForm createJob={createJob} />

      <FilterJobs
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      <BatchUpdate
        batchStatus={batchStatus}
        setBatchStatus={setBatchStatus}
        batchUpdateJobs={batchUpdateJobs}
      />

      <JobList
        jobs={filteredJobs}
        selectedJobs={selectedJobs}
        handleCheckboxChange={handleCheckboxChange}
        updateJobStatus={updateJobStatus}
        archiveJob={archiveJob}
      />
    </div>
  );
}

export default App;
