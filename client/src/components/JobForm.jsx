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
      <input
        type="text"
        placeholder="Job Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={e => setLocation(e.target.value)}
        required
      />

      {/* Empty default keeps 'required' meaningful, so priority is a choice */}
      <select
        value={priority}
        onChange={e => setPriority(e.target.value)}
        required
      >
        <option value="" disabled>
          Priority
        </option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      {/* Optional, so no 'required'. A date input with no value posts '' */}
      <label className="field-label">
        Due date (optional)
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
        />
      </label>

      <button type="submit">Submit Job</button>
    </form>
  );
}

export default JobForm;
