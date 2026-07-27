// Batch update selected jobs
function BatchUpdate({ batchStatus, setBatchStatus, batchUpdateJobs }) {
  return (
    <div className="batch-section">
      <h3>Batch Update Status</h3>

      {/* Status dropdown */}
      <select
        value={batchStatus}
        onChange={e => setBatchStatus(e.target.value)}
      >
        <option value="submitted">Submitted</option>
        <option value="in-progress">In-Progress</option>
        <option value="completed">Completed</option>
      </select>

      {/* Apply batch status to selected jobs */}
      <button onClick={batchUpdateJobs}>Update Selected Jobs</button>
    </div>
  );
}

export default BatchUpdate;
