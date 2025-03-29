import mongoose from 'mongoose';

const speakerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  expertise: {
    type: String,
    required: true,
  },
});

const Speaker = mongoose.model('Speaker', speakerSchema);

export default Speaker;
