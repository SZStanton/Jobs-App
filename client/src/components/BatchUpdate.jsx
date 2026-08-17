// Batch update selected jobs
function BatchUpdate({
  batchStatus,
  setBatchStatus,
  batchUpdateJobs,
  selectedCount,
}) {
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

      {/* Apply batch status to selected jobs. Disabled with nothing selected,
          since the request would match nothing and look like a no-op */}
      <button onClick={batchUpdateJobs} disabled={selectedCount === 0}>
        {selectedCount === 0
          ? 'Update Selected Jobs'
          : `Update ${selectedCount} Selected`}
      </button>
    </div>
  );
}

export default BatchUpdate;
