const Job = require('../models/job.models');

// Pulled off the schema so the allowed values only ever live in one place
const STATUSES = Job.schema.path('status').enumValues;

// Fields a client is allowed to set. Anything else in the body is dropped, so
// nobody can flip 'archived' or backdate 'createdAt' through a normal update
const EDITABLE = ['description', 'location', 'priority', 'status'];

function pickEditable(body = {}) {
  const fields = {};
  for (const key of EDITABLE) {
    if (body[key] !== undefined) fields[key] = body[key];
  }
  return fields;
}

// Mongoose throws these for bad input, which is the client's fault, not a 500
function sendError(res, err, fallback) {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid job id' });
  }
  console.error(err);
  return res.status(500).json({ error: fallback });
}

// CREATE JOB
exports.createJob = async (req, res) => {
  try {
    const job = new Job(pickEditable(req.body));
    const savedJob = await job.save();
    res.status(201).json(savedJob);
  } catch (err) {
    sendError(res, err, 'Error creating job');
  }
};

// GET ALL JOBS (not archived, newest first)
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ archived: false }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    sendError(res, err, 'Error fetching jobs');
  }
};

// UPDATE SINGLE JOB
exports.updateJob = async (req, res) => {
  try {
    const fields = pickEditable(req.body);

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: 'No editable fields in request' });
    }

    // runValidators is off by default on an update, which is what let a junk
    // status past the enum before
    const job = await Job.findByIdAndUpdate(req.params.id, fields, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (err) {
    sendError(res, err, 'Error updating job');
  }
};

// BATCH UPDATE STATUS
exports.batchUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids must be a non-empty array' });
    }

    if (!STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ error: `status must be one of: ${STATUSES.join(', ')}` });
    }

    const result = await Job.updateMany({ _id: { $in: ids } }, { status });
    res.json({ matched: result.matchedCount, modified: result.modifiedCount });
  } catch (err) {
    sendError(res, err, 'Batch update error');
  }
};

// ARCHIVE JOB (soft delete)
exports.archiveJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { archived: true },
      { returnDocument: 'after' },
    );

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (err) {
    sendError(res, err, 'Archive error');
  }
};
