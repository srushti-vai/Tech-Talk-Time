import express from "express";
import cors from "cors";
import eventsRouter from "./routes/event.js";
import speakersRouter from "./routes/speaker.js";
import locationsRouter from "./routes/location.js";
import "./db/connection.js";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/events", eventsRouter);
app.use("/speakers", speakersRouter);
app.use("/locations", locationsRouter);


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

