import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import './styles.css'; // If you need any custom styles

export default function CreateSpeakerForm() {
  const [form, setForm] = useState({
    name: "",
    expertise: ""
  });
  const [isNew, setIsNew] = useState(true);
  const navigate = useNavigate();
  const params = useParams();

  // This effect runs when the component loads or the speaker ID changes.
  useEffect(() => {
    async function fetchData() {
      const speakerId = params.id;
      if (speakerId) {
        setIsNew(false);
        const response = await fetch(`http://localhost:5050/speakers/${speakerId}`);
        if (!response.ok) {
          console.error(`Error: ${response.statusText}`);
          return;
        }
        const speaker = await response.json();
        setForm(speaker);
      }
    }

    fetchData();
  }, [params.id]);

  function updateForm(value) {
    setForm((prev) => ({ ...prev, ...value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      let response;
      if (isNew) {
        // Create new speaker (POST request)
        response = await fetch("http://localhost:5050/speakers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
      } else {
        // Update existing speaker (PATCH request)
        response = await fetch(`http://localhost:5050/speakers/${params.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      navigate("/"); // Redirect to homepage or speaker listing page
    } catch (error) {
      console.error("Error: ", error);
    }
  }

  return (
    <>
      <h3 className="text-lg font-semibold p-4">{isNew ? "Create" : "Update"} Speaker</h3>
      <form onSubmit={onSubmit} className="border rounded-lg p-4 space-y-4">
        <label>
          Name:
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateForm({ name: e.target.value })}
            required
          />
        </label>
        <label>
          Expertise:
          <input
            type="text"
            value={form.expertise}
            onChange={(e) => updateForm({ expertise: e.target.value })}
            required
          />
        </label>
        <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded">
          Save Speaker
        </button>
      </form>
    </>
  );
}
