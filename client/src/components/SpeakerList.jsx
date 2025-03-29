import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Speaker = (props) => (
  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      {props.speaker.name}
    </td>
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      {props.speaker.expertise}
    </td>
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      <div className="flex gap-2">
        <Link
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-green-500 text-white hover:bg-green-600 h-9 rounded-md px-3"
          to={`/speakers/${props.speaker._id}`}
        >
          Edit
        </Link>
        <button
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-red-500 text-white hover:bg-red-600 h-9 rounded-md px-3"
          type="button"
          onClick={() => props.deleteSpeaker(props.speaker._id)}
        >
          Delete
        </button>
      </div>
    </td>
  </tr>
);

export default function SpeakerList() {
  const [speakers, setSpeakers] = useState([]);

  // Fetch speakers from the database
  useEffect(() => {
    async function getSpeakers() {
      try {
        const response = await fetch("http://localhost:5050/speakers/");
        if (!response.ok) {
          throw new Error(`An error occurred: ${response.statusText}`);
        }
        const speakers = await response.json();
        setSpeakers(speakers);
      } catch (error) {
        console.error(error);
      }
    }
    getSpeakers();
  }, []);

  // Delete a speaker
  async function deleteSpeaker(id) {
    try {
      await fetch(`http://localhost:5050/speakers/${id}`, {
        method: "DELETE",
      });
      setSpeakers((prevSpeakers) => prevSpeakers.filter((el) => el._id !== id));
    } catch (error) {
      console.error("Error deleting speaker:", error);
    }
  }

  // Render the list of speakers
  function speakerList() {
    return speakers.map((speaker) => (
      <Speaker
        speaker={speaker}
        deleteSpeaker={deleteSpeaker}
        key={speaker._id}
      />
    ));
  }

  return (
    <>
      <h3 className="text-lg font-semibold p-4">Speaker List</h3>
      <div className="border rounded-lg overflow-hidden">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors bg-blue-400 hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left text-white align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Speaker Name
                </th>
                <th className="h-12 px-4 text-left text-white align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Expertise
                </th>
                <th className="h-12 px-4 text-left text-white align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {speakerList()}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
