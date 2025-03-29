import express from "express";
import cors from "cors";
import eventsRouter from "./routes/event.js";
import speakersRouter from "./routes/speaker.js";
import locationsRouter from "./routes/location.js";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());

// 🔹 Register the routes
app.use("/events", eventsRouter);
app.use("/speakers", speakersRouter);
app.use("/locations", locationsRouter);

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

