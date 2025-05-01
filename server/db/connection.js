import mongoose from "mongoose";

const uri = process.env.ATLAS_URI || "";

mongoose.set("strictQuery", true); // Optional, recommended for Mongoose 6+
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", (error) => console.error("MongoDB connection error:", error));
db.once("open", () => {
  console.log("Connected to MongoDB using Mongoose!");
});

export default db;
