import express from "express";
import db from "../db/connection.js";
import { ObjectId } from "mongodb";
import { body, param, validationResult } from "express-validator"; // Import validator

const router = express.Router();

// Middleware for validating ObjectId
const validateObjectId = (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  next();
};

// Get all speakers
router.get("/", async (req, res) => {
  try {
    let collection = db.collection("speakers");
    let speakers = await collection.find({}).toArray();
    res.status(200).json(speakers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching speakers" });
  }
});

// Get a single speaker by ID
router.get("/:id", validateObjectId, async (req, res) => {
  try {
    const speakerId = new ObjectId(req.params.id);
    let collection = db.collection("speakers");
    let speaker = await collection.findOne({ _id: speakerId });

    if (!speaker) return res.status(404).json({ error: "Speaker not found" });

    res.status(200).json(speaker);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching speaker" });
  }
});

// Create a new speaker (with input validation)
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
      let newSpeaker = {
        speaker_id: new ObjectId(),
        name: req.body.name,
        expertise: req.body.expertise,
      };

      let collection = db.collection("speakers");
      let result = await collection.insertOne(newSpeaker);

      res.status(201).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error adding speaker" });
    }
  }
);

// Update a speaker by ID (with validation)
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
      const speakerId = new ObjectId(req.params.id);
      const updates = { $set: {} };

      if (req.body.name) updates.$set.name = req.body.name;
      if (req.body.expertise) updates.$set.expertise = req.body.expertise;

      let collection = db.collection("speakers");
      let result = await collection.updateOne({ _id: speakerId }, updates);

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Speaker not found" });
      }

      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error updating speaker" });
    }
  }
);

// Delete a speaker by ID (with validation)
router.delete("/:id", validateObjectId, async (req, res) => {
  try {
    const speakerId = new ObjectId(req.params.id);

    const collection = db.collection("speakers");
    const speaker = await collection.findOne({ _id: speakerId });

    if (!speaker) {
      return res.status(404).json({ error: "Speaker not found" });
    }

    const speakerIdToDelete = speaker.speaker_id;

    // Delete related events safely
    const deleteEventsResult = await db.collection("events").deleteMany({
      speaker_id: speakerIdToDelete,
    });

    // Delete speaker
    const deleteSpeakerResult = await collection.deleteOne({ _id: speakerId });

    res.status(200).json({
      speakerDeleted: deleteSpeakerResult.deletedCount,
      eventsDeleted: deleteEventsResult.deletedCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting speaker" });
  }
});

export default router;
