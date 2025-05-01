import express from "express";
import mongoose from "mongoose";
import { body, validationResult } from "express-validator";
import Speaker from "../models/Speaker.js";
import Event from "../models/Event.js";

const router = express.Router();

// Middleware for validating ObjectId
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  next();
};

// Get all speakers
router.get("/", async (req, res) => {
  try {
    const speakers = await Speaker.find();
    res.status(200).json(speakers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching speakers" });
  }
});

// Get a single speaker by ID
router.get("/:id", validateObjectId, async (req, res) => {
  try {
    const speaker = await Speaker.findById(req.params.id);
    if (!speaker) return res.status(404).json({ error: "Speaker not found" });
    res.status(200).json(speaker);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching speaker" });
  }
});

// Create a new speaker
router.post(
  "/",
  [
    body("name").trim().isString().notEmpty().escape(),
    body("expertise").trim().isString().notEmpty().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newSpeaker = new Speaker({
        name: req.body.name,
        expertise: req.body.expertise,
      });

      const savedSpeaker = await newSpeaker.save();
      res.status(201).json(savedSpeaker);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error adding speaker" });
    }
  }
);

// Update a speaker by ID
router.patch(
  "/:id",
  [
    validateObjectId,
    body("name").optional().trim().isString().escape(),
    body("expertise").optional().trim().isString().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updates = {};
      if (req.body.name) updates.name = req.body.name;
      if (req.body.expertise) updates.expertise = req.body.expertise;

      const updatedSpeaker = await Speaker.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true }
      );

      if (!updatedSpeaker) {
        return res.status(404).json({ error: "Speaker not found" });
      }

      res.status(200).json(updatedSpeaker);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error updating speaker" });
    }
  }
);

// Delete a speaker by ID
router.delete("/:id", validateObjectId, async (req, res) => {
  try {
    const speaker = await Speaker.findById(req.params.id);
    if (!speaker) {
      return res.status(404).json({ error: "Speaker not found" });
    }

    const deleteEventsResult = await Event.deleteMany({ speaker_id: speaker._id });
    const deleteSpeakerResult = await Speaker.findByIdAndDelete(req.params.id);

    res.status(200).json({
      speakerDeleted: deleteSpeakerResult ? 1 : 0,
      eventsDeleted: deleteEventsResult.deletedCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting speaker" });
  }
});

export default router;
