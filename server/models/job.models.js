const mongoose = require('mongoose');

// Schema for maintenance jobs
const JobSchema = new mongoose.Schema({
  // Maintenance task description
  description: {
    type: String,
    required: true,
  },
  // Location where the job needs to be completed
  location: {
    type: String,
    required: true,
  },
  // Priority level of job
  priority: {
    type: String,
    required: true,
  },
  // Current status of the job
  status: {
    type: String,
    enum: ['submitted', 'in-progress', 'completed'], // Only status values allowed
    default: 'submitted', // default status
  },
  // Archive jobs instead of deleting
  archived: {
    type: Boolean,
    default: false,
  },
  // Stores the date the job was created on
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Job', JobSchema);
