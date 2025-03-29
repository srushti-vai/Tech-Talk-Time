import express from "express";
import db from "../db/connection.js";
import { ObjectId } from "mongodb";
import { body, param, validationResult } from "express-validator";

const router = express.Router();

// Middleware for validating ObjectId
const validateObjectId = (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  next();
};

// Get all events with speaker name & location name
router.get("/", async (req, res) => {
  try {
    let collection = db.collection("events");
    let results = await collection
      .aggregate([
        {
          $lookup: {
            from: "speakers",
            localField: "speaker_id",
            foreignField: "speaker_id",
            as: "speaker_details",
          },
        },
        {
          $lookup: {
            from: "locations",
            localField: "location_id",
            foreignField: "location_id",
            as: "location_details",
          },
        },
        { $unwind: "$speaker_details" },
        { $unwind: "$location_details" },
        {
          $project: {
            _id: 1,
            event_id: 1,
            title: 1,
            speaker_name: "$speaker_details.name",
            date: 1,
            duration: 1,
            attendees: 1,
            location_name: "$location_details.location",
            rating: 1,
          },
        },
        {
          $sort: {
            date: -1,
          },
        },
      ])
      .toArray();

    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching events" });
  }
});

// Get a single event by ID
router.get("/:id", validateObjectId, async (req, res) => {
  try {
    let collection = db.collection("events");
    let query = { _id: new ObjectId(req.params.id) };
    let event = await collection.findOne(query);

    if (!event) return res.status(404).json({ error: "Event not found" });

    res.status(200).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching event" });
  }
});

// Create a new event (with input validation)
router.post(
  "/",
  [
    body("title").trim().isString().notEmpty().escape(),
    body("speaker_id").trim().isMongoId(),
    body("date").trim().isISO8601(),
    body("duration").isInt({ min: 1 }),
    body("attendees").isInt({ min: 0 }),
    body("location_id").trim().isMongoId(),
    body("rating").optional().isInt({ min: 0, max: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let newEvent = {
        title: req.body.title,
        speaker_id: new ObjectId(req.body.speaker_id),
        date: new Date(req.body.date),
        duration: parseInt(req.body.duration, 10),
        attendees: parseInt(req.body.attendees, 10),
        location_id: new ObjectId(req.body.location_id),
        rating: req.body.rating ? parseInt(req.body.rating, 10) : null,
      };

      let collection = db.collection("events");
      let result = await collection.insertOne(newEvent);
      let createdEvent = await collection.findOne({ _id: result.insertedId });

      res.status(201).json(createdEvent);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error creatings event" });
    }
  }
);

// Update an event by ID (with validation)
router.patch(
  "/:id",
  [
    validateObjectId,
    body("title").optional().trim().isString().escape(),
    body("speaker_id").optional().trim().isMongoId(),
    body("date").optional().trim().isISO8601(),
    body("duration").optional().isInt({ min: 1 }),
    body("attendees").optional().isInt({ min: 0 }),
    body("location_id").optional().trim().isMongoId(),
    body("rating").optional().isInt({ min: 0, max: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const eventId = new ObjectId(req.params.id);
      const updates = { $set: {} };

      if (req.body.title) updates.$set.title = req.body.title;
      if (req.body.speaker_id) updates.$set.speaker_id = new ObjectId(req.body.speaker_id);
      if (req.body.date) updates.$set.date = new Date(req.body.date);
      if (req.body.duration) updates.$set.duration = parseInt(req.body.duration, 10);
      if (req.body.attendees) updates.$set.attendees = parseInt(req.body.attendees, 10);
      if (req.body.location_id) updates.$set.location_id = new ObjectId(req.body.location_id);
      if (req.body.rating) updates.$set.rating = parseInt(req.body.rating, 10);

      let collection = db.collection("events");
      let result = await collection.updateOne({ _id: eventId }, updates);

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Event not found" });
      }

      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error updating event" });
    }
  }
);

// Delete an event by ID (with validation)
router.delete("/:id", validateObjectId, async (req, res) => {
  try {
    const eventId = new ObjectId(req.params.id);
    let collection = db.collection("events");

    let event = await collection.findOne({ _id: eventId });
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    let result = await collection.deleteOne({ _id: eventId });

    res.status(200).json({ deletedCount: result.deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting event" });
  }
});

export default router;
