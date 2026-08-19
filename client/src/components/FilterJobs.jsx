// Narrow the list by keyword or by status
function FilterJobs({ filterStatus, setFilterStatus, search, setSearch }) {
  return (
    <div className="filter-section">
      <h3>Find Jobs</h3>

      <div className="filter-controls">
        {/* Searches description and location together */}
        <label className="field-label">
          Search
          <input
            type="search"
            placeholder="Description or location"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </label>

        {/* Status dropdown */}
        <label className="field-label">
          Status
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="submitted">Submitted</option>
            <option value="in-progress">In-Progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>
      </div>
    </div>
  );
}

export default FilterJobs;
