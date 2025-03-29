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

// Get all locations
router.get("/", async (req, res) => {
  try {
    let collection = db.collection("locations");
    let locations = await collection.find({}).toArray();
    res.status(200).json(locations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching locations" });
  }
});

// Get a single location by ID
router.get("/:id", validateObjectId, async (req, res) => {
  try {
    const locationId = new ObjectId(req.params.id);
    let collection = db.collection("locations");
    let location = await collection.findOne({ _id: locationId });

    if (!location) return res.status(404).json({ error: "Location not found" });

    res.status(200).json(location);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching location" });
  }
});

// Create a new location (with input validation)
router.post(
  "/",
  [
    body("location").trim().isString().notEmpty().escape(),
    body("capacity").isInt({ min: 1 }).toInt(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let newLocation = {
        location_id: new ObjectId(),
        location: req.body.location,
        capacity: req.body.capacity,
      };

      let collection = db.collection("locations");
      let result = await collection.insertOne(newLocation);

      res.status(201).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error adding location" });
    }
  }
);

// Update a location by ID (with validation)
router.patch(
  "/:id",
  [
    validateObjectId,
    body("location").optional().trim().isString().escape(),
    body("capacity").optional().isInt({ min: 1 }).toInt(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const locationId = new ObjectId(req.params.id);
      const updates = { $set: {} };

      if (req.body.location) updates.$set.location = req.body.location;
      if (req.body.capacity) updates.$set.capacity = req.body.capacity;

      let collection = db.collection("locations");
      let result = await collection.updateOne({ _id: locationId }, updates);

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Location not found" });
      }

      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error updating location" });
    }
  }
);

// Delete a location by ID (with validation)
router.delete("/:id", validateObjectId, async (req, res) => {
  try {
    const locationId = new ObjectId(req.params.id);

    const collection = db.collection("locations");
    const location = await collection.findOne({ _id: locationId });

    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }

    const locationIdToDelete = location.location_id;

    // Delete related events safely
    const deleteEventsResult = await db.collection("events").deleteMany({
      location_id: locationIdToDelete,
    });

    // Delete location
    const deleteLocationResult = await collection.deleteOne({ _id: locationId });

    res.status(200).json({
      locationDeleted: deleteLocationResult.deletedCount,
      eventsDeleted: deleteEventsResult.deletedCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting location" });
  }
});

export default router;
