const express = require('express');
const router = express.Router();

const jobController = require('../controllers/job.controller');

// ROUTES

// Create new job
router.post('/', jobController.createJob);
// Get all jobs
router.get('/', jobController.getAllJobs);
// Get archived jobs. Must sit above '/:id' style routes to not be swallowed
router.get('/archived', jobController.getArchivedJobs);
// Update a single job
router.put('/:id', jobController.updateJob);
// Update multiple jobs statuses
router.put('/batch/update', jobController.batchUpdateStatus);
// Archive a job
router.put('/:id/archive', jobController.archiveJob);
// Restore a job out of the archive
router.put('/:id/restore', jobController.restoreJob);
// Delete a job for good
router.delete('/:id', jobController.deleteJob);

module.exports = router;
