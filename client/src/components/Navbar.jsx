import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <div>
      <nav className="flex justify-between items-center mb-6 bg-blue-400 p-4">
        {/* Title Text */}
        <NavLink to="/" className="text-2xl font-bold text-white">
          Tech Talk Time
        </NavLink>

        {/* Links aligned to the right */}
        <div className="ml-auto flex space-x-4">
          {/* Create Event Link */}
          <NavLink
            className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium text-blue-600 bg-white border border-blue-400 hover:bg-blue-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 rounded-md px-3 transition-colors"
            to="/create"
          >
            Create Event
          </NavLink>
          
          {/* Add Location Link */}
          <NavLink
            className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium text-blue-600 bg-white border border-blue-400 hover:bg-blue-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 rounded-md px-3 transition-colors"
            to="/locations"
          >
            Add Location
          </NavLink>

          {/* Add Speaker Link */}
          <NavLink
            className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium text-blue-600 bg-white border border-blue-400 hover:bg-blue-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 rounded-md px-3 transition-colors"
            to="/speakers"
          >
            Add Speaker
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
