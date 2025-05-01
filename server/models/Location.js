import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
    location: { 
        type: String,
        required: true,
        trim: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1 
    },
});

export default mongoose.model("Location", locationSchema);;
