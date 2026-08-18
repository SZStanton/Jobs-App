// Batch update selected jobs
function BatchUpdate({
  batchStatus,
  setBatchStatus,
  batchUpdateJobs,
  selectedCount,
}) {
  return (
    <div className="batch-section">
      <h3>Batch Update</h3>

      <div className="batch-controls">
        {/* Status dropdown */}
        <label className="field-label">
          Set status to
          <select
            value={batchStatus}
            onChange={e => setBatchStatus(e.target.value)}
          >
            <option value="submitted">Submitted</option>
            <option value="in-progress">In-Progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>

        {/* Apply batch status to selected jobs. Disabled with nothing selected,
            since the request would match nothing and look like a no-op */}
        <button onClick={batchUpdateJobs} disabled={selectedCount === 0}>
          {selectedCount === 0
            ? 'Update Selected Jobs'
            : `Update ${selectedCount} Selected`}
        </button>
      </div>
    </div>
  );
}

export default BatchUpdate;
