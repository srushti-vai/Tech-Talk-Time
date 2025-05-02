import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Event = (props) => (
  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
    <td className="p-4 align-middle">{props.event.title}</td>
    <td className="p-4 align-middle">{props.event.speaker_name}</td>
    <td className="p-4 align-middle">{new Date(props.event.date).toLocaleDateString()}</td>
    <td className="p-4 align-middle">{props.event.duration} mins</td>
    <td className="p-4 align-middle">{props.event.attendees}</td>
    <td className="p-4 align-middle">{props.event.location_name}</td>
    <td className="p-4 align-middle">{props.event.rating} / 5</td>
    <td className="p-4 align-middle">
      <div className="flex gap-2">
        <Link
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          to={`/edit/event/${props.event._id}`}
        >
          Edit
        </Link>
        <button
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          onClick={() => props.deleteEvent(props.event._id)}
        >
          Delete
        </button>
      </div>
    </td>
  </tr>
);

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    speaker_id: "",
    location_id: "",
    startDate: "",
    endDate: ""
  });;

  // Fetch all data
  useEffect(() => {
    async function fetchData() {
      try {
        const [eventsRes, speakersRes, locationsRes] = await Promise.all([
          fetch("http://localhost:5050/events"),
          fetch("http://localhost:5050/speakers"),
          fetch("http://localhost:5050/locations"),
        ]);

        if (!eventsRes.ok || !speakersRes.ok || !locationsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const events = await eventsRes.json();
        const speakers = await speakersRes.json();
        const locations = await locationsRes.json();

        setEvents(events);
        setSpeakers(speakers);
        setLocations(locations);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  async function deleteEvent(id) {
    try {
      await fetch(`http://localhost:5050/events/${id}`, {
        method: "DELETE",
      });
      setEvents((prevEvents) => prevEvents.filter((el) => el._id !== id));
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  }

  async function applyFilters() {
    try {
      let query = new URLSearchParams();
      if (filters.speaker_id) query.append("speaker_id", filters.speaker_id);
      if (filters.location_id) query.append("location_id", filters.location_id);
      if (filters.startDate) query.append("startDate", filters.startDate);
      if (filters.endDate) query.append("endDate", filters.endDate);

      const response = await fetch(`http://localhost:5050/events?${query.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch filtered events");

      const filtered = await response.json();
      setEvents(filtered);
      setFilterOpen(false);
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  }

  async function resetFilters() {
    try {
      setFilters({ speaker_id: "", location_id: "", startDate: "", endDate: "" });
      const response = await fetch("http://localhost:5050/events");
      if (!response.ok) throw new Error("Failed to fetch all events");
      const allEvents = await response.json();
      setEvents(allEvents);
    } catch (error) {
      console.error("Error resetting filters:", error);
    }
  }
  
  function average(arr, precision = 0) {
    if (arr.length === 0) return 0;
    const sum = arr.reduce((a, b) => a + b, 0);
    const avg = sum / arr.length;
    return avg.toFixed(precision);
  }

  function eventList() {
    return events.map((event) => (
      <Event event={event} deleteEvent={deleteEvent} key={event._id} />
    ));
  }

  return (
    <>
      <div className="p-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Event List</h3>
        <div className="flex gap-2">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => setFilterOpen(true)}
          >
            Filter
          </button>
          <button
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {!filterOpen && (filters.speaker_id || filters.location_id || filters.startDate || filters.endDate) && events.length > 0 && (
            <div className="mt-6 border rounded-lg p-4 bg-gray-50">
              <h4 className="text-lg font-semibold mb-2">Report</h4>
              <p><strong>Number of matching entries:</strong> {events.length}</p>
              <p><strong>Average duration:</strong> {average(events.map(e => e.duration))} mins</p>
              <p><strong>Average attendees:</strong> {average(events.map(e => e.attendees))}</p>
              <p><strong>Average rating:</strong> {average(events.map(e => e.rating), 1)} / 5</p>
            </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="bg-blue-400 text-white border-b">
                <th className="px-4 py-3 text-left">Event Title</th>
                <th className="px-4 py-3 text-left">Speaker</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Duration</th>
                <th className="px-4 py-3 text-left">Attendees</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Rating</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>{eventList()}</tbody>
          </table>

        </div>
      </div>

      {/* Filter Modal */}
      {filterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-96 space-y-4">
            <h4 className="text-lg font-semibold">Filter Events</h4>

            <label className="block">
              Speaker:
              <select
                className="w-full mt-1 border p-2 rounded"
                value={filters.speaker_id}
                onChange={(e) => setFilters({ ...filters, speaker_id: e.target.value })}
              >
                <option value="">All</option>
                {speakers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              Location:
              <select
                className="w-full mt-1 border p-2 rounded"
                value={filters.location_id}
                onChange={(e) => setFilters({ ...filters, location_id: e.target.value })}
              >
                <option value="">All</option>
                {locations.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.location}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              Start Date:
              <input
                type="date"
                className="w-full mt-1 border p-2 rounded"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </label>

            <label className="block">
              End Date:
              <input
                type="date"
                className="w-full mt-1 border p-2 rounded"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </label>

            <div className="flex justify-between pt-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => {
                  setFilters({ speaker_id: "", location_id: "", startDate: "", endDate: "" });
                  setFilterOpen(false);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={applyFilters}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";

// const Event = (props) => (
//   <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
//     <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
//       {props.event.title}
//     </td>
//     <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
//       {props.event.speaker_name}
//     </td>
//     <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
//       {new Date(props.event.date).toLocaleDateString()}
//     </td>
//     <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
//       {props.event.duration} mins
//     </td>
//     <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
//       {props.event.attendees}
//     </td>
//     <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
//       {props.event.location_name}
//     </td>
//     <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
//       {props.event.rating} / 5
//     </td>
//     <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
//       <div className="flex gap-2">
//         <Link
//           className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-green-500 text-white hover:bg-green-600 h-9 rounded-md px-3"
//           to={`/edit/event/${props.event._id}`}
//         >
//           Edit
//         </Link>
//         <button
//           className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-red-500 text-white hover:bg-red-600 h-9 rounded-md px-3"
//           type="button"
//           onClick={() => props.deleteEvent(props.event._id)}
//         >
//           Delete
//         </button>
//       </div>
//     </td>
//   </tr>
// );

// export default function EventList() {
//   const [events, setEvents] = useState([]);

//   // Fetch events from the database.
//   useEffect(() => {
//     async function getEvents() {
//       try {
//         const response = await fetch("http://localhost:5050/events/");
//         if (!response.ok) {
//           throw new Error(`An error occurred: ${response.statusText}`);
//         }
//         const events = await response.json();
//         setEvents(events);
//       } catch (error) {
//         console.error(error);
//       }
//     }
//     getEvents();
//   }, []);

//   // Delete a event
//   async function deleteEvent(id) {
//     try {
//       await fetch(`http://localhost:5050/events/${id}`, {
//         method: "DELETE",
//       });
//       setEvents((prevEvents) => prevEvents.filter((el) => el._id !== id));
//     } catch (error) {
//       console.error("Error deletings event:", error);
//     }
//   }

//   // Render the list of events
//   function eventList() {
//     return events.map((event) => (
//       <Event
//         event={event}
//         deleteEvent={deleteEvent}
//         key={event._id}
//       />
//     ));
//   }

//   return (
//     <>
//       <h3 className="text-lg font-semibold p-4">Event List</h3>
//       <div className="border rounded-lg overflow-hidden">
//         <div className="relative w-full overflow-auto">
//           <table className="w-full caption-bottom text-sm">
//             <thead className="[&_tr]:border-b">
//               <tr className="border-b transition-colors bg-blue-400 hover:bg-muted/50 data-[state=selected]:bg-muted">
//                 <th className="h-12 px-4 text-left text-white align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
//                   Event Title
//                 </th>
//                 <th className="h-12 px-4 text-left text-white align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
//                   Speaker
//                 </th>
//                 <th className="h-12 px-4 text-left text-white align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
//                   Date
//                 </th>
//                 <th className="h-12 px-4 text-left text-white align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
//                   Duration
//                 </th>
//                 <th className="h-12 px-4 text-left text-white align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
//                   Attendees
//                 </th>
//                 <th className="h-12 px-4 text-left text-white align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
//                   Location
//                 </th>
//                 <th className="h-12 px-4 text-left text-white align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
//                   Rating
//                 </th>
//                 <th className="h-12 px-4 text-left text-white align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
//                   Action
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="[&_tr:last-child]:border-0">
//               {eventList()}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </>
//   );
// }
