import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the Event schema
const eventSchema = new Schema(
  {
    title: { type: String, required: true },
    speaker_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Speaker', required: true },
    date: { type: Date, required: true },
    duration: { type: Number, required: true },
    attendees: { type: Number, required: true },
    location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
  },
  { timestamps: true }
);

eventSchema.index({ date: 1 });
eventSchema.index({ speaker_id: 1 });
eventSchema.index({ location_id: 1 });

// Create the Event model
const Event = mongoose.model('Event', eventSchema);

export default Event;
