const express = require('express');
const router = express.Router();

const jobController = require('../controllers/job.controller');

// ROUTES

// Create new job
router.post('/', jobController.createJob);
// Get all jobs
router.get('/', jobController.getAllJobs);
// Update a single job
router.put('/:id', jobController.updateJob);
// Update multiple jobs statuses
router.put('/batch/update', jobController.batchUpdateStatus);
// Archive a job
router.put('/:id/archive', jobController.archiveJob);
// Filter jobs by status
router.get('/status/:status', jobController.filterByStatus);

module.exports = router;
