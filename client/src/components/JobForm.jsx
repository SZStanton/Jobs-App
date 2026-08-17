import { useState } from 'react';

// Form to create a new job
function JobForm({ createJob }) {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('');

  // Handles form submission
  const handleSubmit = event => {
    event.preventDefault();

    createJob({
      description,
      location,
      priority,
    });
    setDescription('');
    setLocation('');
    setPriority('');
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
      <button type="submit">Submit Job</button>
    </form>
  );
}

export default JobForm;
