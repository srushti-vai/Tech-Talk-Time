import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Event = (props) => (
  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      {props.event.title}
    </td>
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      {props.event.speaker_name}
    </td>
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      {new Date(props.event.date).toLocaleDateString()}
    </td>
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      {props.event.duration} mins
    </td>
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      {props.event.attendees}
    </td>
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      {props.event.location_name}
    </td>
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      {props.event.rating} / 5
    </td>
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      <div className="flex gap-2">
        <Link
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-green-500 text-white hover:bg-green-600 h-9 rounded-md px-3"
          to={`/edit/event/${props.event._id}`}
        >
          Edit
        </Link>
        <button
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-red-500 text-white hover:bg-red-600 h-9 rounded-md px-3"
          type="button"
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

  // Fetch events from the database.
  useEffect(() => {
    async function getEvents() {
      try {
        const response = await fetch("http://localhost:5050/events/");
        if (!response.ok) {
          throw new Error(`An error occurred: ${response.statusText}`);
        }
        const events = await response.json();
        setEvents(events);
      } catch (error) {
        console.error(error);
      }
    }
    getEvents();
  }, []);

  // Delete a event
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

  // Render the list of events
  function eventList() {
    return events.map((event) => (
      <Event
        event={event}
        deleteEvent={deleteEvent}
        key={event._id}
      />
    ));
  }

  return (
    <>
      <h3 className="text-lg font-semibold p-4">Event List</h3>
      <div className="border rounded-lg overflow-hidden">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors bg-blue-400 hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left text-white align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Event Title
                </th>
                <th className="h-12 px-4 text-left text-white align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Speaker
                </th>
                <th className="h-12 px-4 text-left text-white align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Date
                </th>
                <th className="h-12 px-4 text-left text-white align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Duration
                </th>
                <th className="h-12 px-4 text-left text-white align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Attendees
                </th>
                <th className="h-12 px-4 text-left text-white align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Location
                </th>
                <th className="h-12 px-4 text-left text-white align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Rating
                </th>
                <th className="h-12 px-4 text-left text-white align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {eventList()}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
