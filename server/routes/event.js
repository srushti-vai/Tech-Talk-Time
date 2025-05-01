import express from "express";
import mongoose from "mongoose";
import { body, validationResult } from "express-validator";
import Event from "../models/Event.js";
import Speaker from "../models/Speaker.js";
import Location from "../models/Location.js";

const router = express.Router();

const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  next();
};

// Get all events with populated speaker and location names
router.get("/", async (req, res) => {
  try {
    const events = await Event.find()
      .populate("speaker_id", "name")
      .populate("location_id", "location")
      .sort({ date: -1 });

    const formatted = events.map(e => ({
      _id: e._id,
      title: e.title,
      speaker_name: e.speaker_id.name,
      date: e.date,
      duration: e.duration,
      attendees: e.attendees,
      location_name: e.location_id.location,
      rating: e.rating,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching events" });
  }
});

// Get a single event
router.get("/:id", validateObjectId, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.status(200).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching event" });
  }
});

// Create a new event
router.post(
  "/",
  [
    body("title").trim().notEmpty().escape(),
    body("speaker_id").isMongoId(),
    body("location_id").isMongoId(),
    body("date").isISO8601(),
    body("duration").isInt({ min: 1 }),
    body("attendees").isInt({ min: 0 }),
    body("rating").optional().isInt({ min: 0, max: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const event = new Event({
        title: req.body.title,
        speaker_id: req.body.speaker_id,
        location_id: req.body.location_id,
        date: new Date(req.body.date),
        duration: req.body.duration,
        attendees: req.body.attendees,
        rating: req.body.rating ?? null,
      });

      const saved = await event.save();
      res.status(201).json(saved);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error creating event" });
    }
  }
);

// Update an event
router.patch(
  "/:id",
  [
    validateObjectId,
    body("title").optional().trim().isString().escape(),
    body("speaker_id").optional().isMongoId(),
    body("location_id").optional().isMongoId(),
    body("date").optional().isISO8601(),
    body("duration").optional().isInt({ min: 1 }),
    body("attendees").optional().isInt({ min: 0 }),
    body("rating").optional().isInt({ min: 0, max: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const updateFields = {};
      if (req.body.title) updateFields.title = req.body.title;
      if (req.body.speaker_id) updateFields.speaker_id = req.body.speaker_id;
      if (req.body.location_id) updateFields.location_id = req.body.location_id;
      if (req.body.date) updateFields.date = new Date(req.body.date);
      if (req.body.duration) updateFields.duration = req.body.duration;
      if (req.body.attendees) updateFields.attendees = req.body.attendees;
      if (req.body.rating !== undefined) updateFields.rating = req.body.rating;

      const updated = await Event.findByIdAndUpdate(req.params.id, updateFields, {
        new: true,
      });

      if (!updated) return res.status(404).json({ error: "Event not found" });
      res.status(200).json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error updating event" });
    }
  }
);

// Delete an event
router.delete("/:id", validateObjectId, async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Event not found" });
    res.status(200).json({ deletedCount: 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting event" });
  }
});

export default router;
