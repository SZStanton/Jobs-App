import { useState } from 'react';

// Form to create a new job
function JobForm({ createJob }) {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Handles form submission
  const handleSubmit = event => {
    event.preventDefault();

    createJob({
      description,
      location,
      priority,
      dueDate,
    });
    setDescription('');
    setLocation('');
    setPriority('');
    setDueDate('');
  };

  return (
    <form onSubmit={handleSubmit} className="job-form">
      <h3>Log a Job</h3>

      <div className="job-form-fields">
        <label className="field-label">
          Description
          <input
            type="text"
            placeholder="What needs doing"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
        </label>

        <label className="field-label">
          Location
          <input
            type="text"
            placeholder="Where"
            value={location}
            onChange={e => setLocation(e.target.value)}
            required
          />
        </label>

        <label className="field-label">
          Priority
          {/* Empty default keeps 'required' meaningful, so it stays a choice */}
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            required
          >
            <option value="" disabled>
              Choose
            </option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        {/* Optional, so no 'required'. A date input with no value posts '' */}
        <label className="field-label">
          Due date
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="button-primary">
          Submit Job
        </button>
      </div>
    </form>
  );
}

export default JobForm;
