const express = require("express");
const Assignment = require("../models/assignment.model");
const adminAuth = require("../middleware/adminAuth");
const User = require("../models/user.model");
const router = express.Router();

router.post("/assignments", adminAuth, async (req, res) => {
  try {
    const assignment = new Assignment(req.body);
    const user = await User.findOne({ referralCode: req.body.referralCode });
    user.amount += assignment.amount * 0.1;
    await user.save();
    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all assignments (GET)
router.get("/assignments", async (req, res) => {
  try {
    const assignments = await Assignment.find();
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific assignment by ID (GET)
router.get("/assignments/:id", adminAuth, async (req, res) => {
  const id = req.params.id;
  try {
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an assignment by ID (PUT)
router.put("/assignments/:id", adminAuth, async (req, res) => {
  const id = req.params.id;
  try {
    const oldAssignment = await Assignment.findById(id);
    const assignment = await Assignment.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    const user = await User.findOne({ referralCode: assignment.referralCode });

    user.amount =
      user.amount - oldAssignment.amount * 0.1 + assignment.amount * 0.1;
    await user.save();
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an assignment by ID (DELETE)
router.delete("/assignments/:id", adminAuth, async (req, res) => {
  const id = req.params.id;
  console.log(id);
  try {
    const assignment = await Assignment.findByIdAndRemove(id);

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    const user = await User.findOne({
      referralCode: assignment.referralCode,
    });
    user.amount -= 0.1 * assignment.amount;

    await user.save();
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete an assignment
router.get("/complete/:id", adminAuth, async (req, res) => {
  const id = req.params.id;
  console.log(id);
  try {
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    assignment.completed = true;
    await assignment.save();
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
