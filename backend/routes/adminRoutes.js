const express = require('express');
const auth = require('../middleware/authMiddleware');

const University = require('../models/University');
const Regulation = require('../models/Regulation');
const Branch = require('../models/Branch');
const Subject = require('../models/Subject');
const Unit = require('../models/Unit');

const router = express.Router();

// all routes here require admin role
router.use(auth('admin'));

// POST /api/admin/universities
// POST /api/admin/universities
router.post('/universities', async (req, res) => {
  try {
    const { name, code, logoUrl } = req.body;   // accept logoUrl
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    const existing = await University.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'University already exists' });
    }
    const uni = await University.create({ name, code, logoUrl }); // save logoUrl
    res.status(201).json(uni);
  } catch (err) {
    console.error('Create university error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// POST /api/admin/regulations
router.post('/regulations', async (req, res) => {
  try {
    const { name, universityId } = req.body;
    if (!name || !universityId) {
      return res.status(400).json({ message: 'Name and universityId required' });
    }
    const reg = await Regulation.create({ name, university: universityId });
    res.status(201).json(reg);
  } catch (err) {
    console.error('Create regulation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/branches
router.post('/branches', async (req, res) => {
  try {
    const { name, code, regulationId } = req.body;
    if (!name || !regulationId) {
      return res.status(400).json({ message: 'Name and regulationId required' });
    }
    const branch = await Branch.create({ name, code, regulation: regulationId });
    res.status(201).json(branch);
  } catch (err) {
    console.error('Create branch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/subjects
router.post('/subjects', async (req, res) => {
  try {
    const { name, code, branchId } = req.body;
    if (!name || !branchId) {
      return res.status(400).json({ message: 'Name and branchId required' });
    }
    const subject = await Subject.create({ name, code, branch: branchId });
    res.status(201).json(subject);
  } catch (err) {
    console.error('Create subject error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/units
router.post('/units', async (req, res) => {
  try {
    const { title, order, subjectId } = req.body;
    if (!title || !subjectId) {
      return res.status(400).json({ message: 'Title and subjectId required' });
    }
    const unit = await Unit.create({ title, order, subject: subjectId });
    res.status(201).json(unit);
  } catch (err) {
    console.error('Create unit error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/universities/:id
router.delete('/universities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const uni = await University.findByIdAndDelete(id);
    if (!uni) {
      return res.status(404).json({ message: 'University not found' });
    }
    res.json({ message: 'University deleted' });
  } catch (err) {
    console.error('Delete university error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/regulations/:id
router.delete('/regulations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const reg = await Regulation.findByIdAndDelete(id);
    if (!reg) {
      return res.status(404).json({ message: 'Regulation not found' });
    }
    res.json({ message: 'Regulation deleted' });
  } catch (err) {
    console.error('Delete regulation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/branches/:id
router.delete('/branches/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findByIdAndDelete(id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    res.json({ message: 'Branch deleted' });
  } catch (err) {
    console.error('Delete branch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/subjects/:id
router.delete('/subjects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findByIdAndDelete(id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    console.error('Delete subject error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/units/:id
router.delete('/units/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const unit = await Unit.findByIdAndDelete(id);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }
    res.json({ message: 'Unit deleted' });
  } catch (err) {
    console.error('Delete unit error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
