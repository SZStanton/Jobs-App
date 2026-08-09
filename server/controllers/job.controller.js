const Job = require('../models/job.models');

// CREATE JOB
exports.createJob = async (req, res) => {
  try {
    // Create a new job using request data
    const job = new Job({
      description: req.body.description,
      location: req.body.location,
      priority: req.body.priority,
    });

    // Save the job to the database
    const savedJob = await job.save();
    // Send the saved job back to client
    res.send(savedJob);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating job');
  }
};

// GET ALL JOBS (sorted + not archived)
exports.getAllJobs = async (req, res) => {
  try {
    // Find all jobs that are not archived
    // Sort by status and newest created date
    const jobs = await Job.find({ archived: false }).sort({
      status: 1,
      createdAt: -1,
    });

    res.send(jobs); // Return all jobs
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching jobs');
  }
};

// UPDATE SINGLE JOB
exports.updateJob = async (req, res) => {
  try {
    // Find a job by ID and update it, then return updated document
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.send(job); // Send updated job
  } catch (err) {
    console.error(err);
    res.status(500).send('update error');
  }
};

// BATCH UPDATE STATUS
exports.batchUpdateStatus = async (req, res) => {
  try {
    // Update multiple jobs at once
    // Match all selected IDs, then set the new status
    const result = await Job.updateMany(
      { _id: { $in: req.body.ids } },
      { status: req.body.status },
    );

    res.send(result); // Return update result
  } catch (err) {
    console.error(err);
    res.status(500).send('Batch update error');
  }
};

// ARCHIVE JOB (soft delete)
exports.archiveJob = async (req, res) => {
  try {
    // Mark job as archived instead of deleting
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { archived: true },
      { new: true },
    );

    res.send(job); // Send archived job
  } catch (err) {
    console.error(err);
    res.status(500).send('Archive error');
  }
};

// FILTER JOBS BY STATUS
exports.filterByStatus = async (req, res) => {
  try {
    // Find jobs with matching status
    // Show newest jobs first
    const jobs = await Job.find({
      status: req.params.status,
      archived: false,
    }).sort({
      createdAt: -1,
    });

    res.send(jobs); // Return filtered jobs
  } catch (err) {
    console.error(err);
    res.status(500).send('Filter error');
  }
};
