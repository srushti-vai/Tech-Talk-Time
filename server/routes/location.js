import express from "express";
import { body, validationResult } from "express-validator";
import mongoose from "mongoose";
import Location from "../models/Location.js";

const router = express.Router();

// Middleware for validating ObjectId
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  next();
};

// Get all locations
router.get("/", async (req, res) => {
  try {
    const locations = await Location.find();
    res.status(200).json(locations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching locations" });
  }
});

// Get a single location by ID
router.get("/:id", validateObjectId, async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) return res.status(404).json({ error: "Location not found" });
    res.status(200).json(location);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching location" });
  }
});

// Create a new location
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
      const newLocation = new Location({
        location: req.body.location,
        capacity: req.body.capacity,
      });

      const savedLocation = await newLocation.save();
      res.status(201).json(savedLocation);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error adding location" });
    }
  }
);

// Update a location
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
      const updates = {};
      if (req.body.location) updates.location = req.body.location;
      if (req.body.capacity) updates.capacity = req.body.capacity;

      const updatedLocation = await Location.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true }
      );

      if (!updatedLocation) {
        return res.status(404).json({ error: "Location not found" });
      }

      res.status(200).json(updatedLocation);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error updating location" });
    }
  }
);

// Delete a location
router.delete("/:id", validateObjectId, async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }

    const deleteEventsResult = await Event.deleteMany({ location_id: location._id });
    const deleteLocationResult = await Location.findByIdAndDelete(req.params.id);

    res.status(200).json({
      locationDeleted: deleteLocationResult ? 1 : 0,
      eventsDeleted: deleteEventsResult.deletedCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting location" });
  }
});

export default router;
