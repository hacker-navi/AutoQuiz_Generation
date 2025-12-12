// routes/publicRoutes.js
const express = require('express');
const University = require('../models/University');
const Regulation = require('../models/Regulation');
const Branch = require('../models/Branch');
const Subject = require('../models/Subject');
const Unit = require('../models/Unit');
const Content = require('../models/Content');

const router = express.Router();

// GET /api/public/universities
router.get('/universities', async (req, res) => {
  try {
    const universities = await University.find().sort({ name: 1 });
    res.json(universities);
  } catch (err) {
    console.error('Get universities error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/public/regulations/:universityId
router.get('/regulations/:universityId', async (req, res) => {
  try {
    const regs = await Regulation.find({
      university: req.params.universityId,
    }).sort({ name: 1 });
    res.json(regs);
  } catch (err) {
    console.error('Get regulations error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/public/branches/:regulationId
router.get('/branches/:regulationId', async (req, res) => {
  try {
    const branches = await Branch.find({
      regulation: req.params.regulationId,
    }).sort({ name: 1 });
    res.json(branches);
  } catch (err) {
    console.error('Get branches error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/public/subjects/:branchId
router.get('/subjects/:branchId', async (req, res) => {
  try {
    const subjects = await Subject.find({
      branch: req.params.branchId,
    }).sort({ name: 1 });
    res.json(subjects);
  } catch (err) {
    console.error('Get subjects error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/public/units/:subjectId
router.get('/units/:subjectId', async (req, res) => {
  try {
    const units = await Unit.find({
      subject: req.params.subjectId,
    }).sort({ order: 1 });
    res.json(units);
  } catch (err) {
    console.error('Get units error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/public/unit-details/:unitId
// returns unit + its contents (for student view)
router.get('/unit-details/:unitId', async (req, res) => {
  try {
    const unitId = req.params.unitId;

    const unit = await Unit.findById(unitId).populate('subject');
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    const contents = await Content.find({ unit: unitId }).sort({ createdAt: -1 });

    res.json({
      unit,
      contents,
      // later: quizzes, flashcards, games etc for this unit
    });
  } catch (err) {
    console.error('Get unit details error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
