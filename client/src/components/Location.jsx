import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './styles.css'; // If you need any custom styles

export default function CreateLocationForm() {
  const [form, setForm] = useState({
    location: "",
    capacity: ""
  });
  const [isNew, setIsNew] = useState(true);  // Track if we're creating or updating
  const params = useParams();
  const navigate = useNavigate();

  // Fetch the existing location data if we're updating
  useEffect(() => {
    async function fetchLocationData() {
      const locationId = params.id;
      if (locationId) {
        setIsNew(false); // We're updating an existing location
        const response = await fetch(`http://localhost:5050/locations/${locationId}`);
        if (!response.ok) {
          console.error(`Error: ${response.statusText}`);
          return;
        }
        const location = await response.json();
        setForm(location); // Set form state to existing location data
      }
    }

    fetchLocationData();
  }, [params.id]); // Re-run whenever params.id changes

  function updateForm(value) {
    setForm((prev) => ({ ...prev, ...value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      let response;
      if (isNew) {
        // Create new location (POST request)
        response = await fetch("http://localhost:5050/locations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
      } else {
        // Update existing location (PATCH request)
        response = await fetch(`http://localhost:5050/locations/${params.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      navigate("/"); // Redirect to homepage or location listing page
    } catch (error) {
      console.error("Error: ", error);
    }
  }

  return (
    <>
      <h3 className="text-lg font-semibold p-4">{isNew ? "Create" : "Update"} Location</h3>
      <form onSubmit={onSubmit} className="border rounded-lg p-4 space-y-4">
        <label>
          Location Name:
          <input
            type="text"
            value={form.location}
            onChange={(e) => updateForm({ location: e.target.value })}
            required
          />
        </label>
        <label>
          Capacity:
          <input
            type="number"
            value={form.capacity}
            onChange={(e) => updateForm({ capacity: e.target.value })}
            required
          />
        </label>
        <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded">
          Save Location
        </button>
      </form>
    </>
  );
}
