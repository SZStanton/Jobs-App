// Filter jobs by status
function FilterJobs({ filterStatus, setFilterStatus }) {
  return (
    <div className="filter-section">
      <h3>Filter Jobs</h3>

      {/* Status dropdown */}
      <select
        value={filterStatus}
        onChange={e => setFilterStatus(e.target.value)}
      >
        <option value="all">All</option>
        <option value="submitted">Submitted</option>
        <option value="in-progress">In-Progress</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  );
}

export default FilterJobs;
