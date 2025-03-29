import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './styles.css'; 

export default function EventForm() {
  const [form, setForm] = useState({
    title: "",
    speaker_id: "",
    date: "",
    duration: "",
    attendees: "",
    location_id: "",
    rating: ""
  });
  const [isNew, setIsNew] = useState(true);
  const [speakers, setSpeakers] = useState([]);
  const [locations, setLocations] = useState([]);
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const eventId = params.id?.toString();
      if (eventId) {
        setIsNew(false);
        const response = await fetch(`http://localhost:5050/events/${eventId}`);
        if (!response.ok) {
          console.error(`Error: ${response.statusText}`);
          return;
        }
        const event = await response.json();
        setForm(event);
      }
    }

    async function fetchSpeakersAndLocations() {
      const speakersRes = await fetch("http://localhost:5050/speakers");
      const locationsRes = await fetch("http://localhost:5050/locations");
      if (speakersRes.ok) setSpeakers(await speakersRes.json());
      if (locationsRes.ok) setLocations(await locationsRes.json());
    }

    fetchData();
    fetchSpeakersAndLocations();
  }, [params.id]);

  function updateForm(value) {
    setForm((prev) => ({ ...prev, ...value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      let response;
      if (isNew) {
        response = await fetch("http://localhost:5050/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
      } else {
        response = await fetch(`http://localhost:5050/events/${params.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      navigate("/");
    } catch (error) {
      console.error("Error: ", error);
    }
  }

  return (
    <>
      <h3 className="text-lg font-semibold p-4">{isNew ? "Create" : "Update"} Event</h3>
      <form onSubmit={onSubmit} className="border rounded-lg p-4 space-y-4">
        <label>
          Title:
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateForm({ title: e.target.value })}
            required
          />
        </label>
        <label>
          Speaker:
          <select
            value={form.speaker_id}
            onChange={(e) => updateForm({ speaker_id: e.target.value })}
            required
          >
            <option value="">Select a Speaker</option>
            {speakers.map((s) => (
              <option key={s.speaker_id} value={s.speaker_id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date:
          <input
            type="date"
            value={form.date}
            onChange={(e) => updateForm({ date: e.target.value })}
            required
          />
        </label>
        <label>
          Duration:
          <input
            type="text"
            value={form.duration}
            onChange={(e) => updateForm({ duration: e.target.value })}
            required
          />
        </label>
        <label>
          Attendees:
          <input
            type="number"
            value={form.attendees}
            onChange={(e) => updateForm({ attendees: e.target.value })}
            required
          />
        </label>
        <label>
          Location:
          <select
            value={form.location_id}
            onChange={(e) => updateForm({ location_id: e.target.value })}
            required
          >
            <option value="">Select a Location</option>
            {locations.map((l) => (
              <option key={l.location_id} value={l.location_id}>
                {l.location}
              </option>
            ))}
          </select>
        </label>
        <label>
          Rating:
          <input
            type="number"
            value={form.rating}
            onChange={(e) => updateForm({ rating: e.target.value })}
            required
          />
        </label>
        <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded">
          Save Event
        </button>
      </form>
    </>
  );
}
