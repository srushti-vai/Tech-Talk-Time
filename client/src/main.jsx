import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import Event from "./components/Event";
import EventList from "./components/EventList";
import Location from "./components/Location";
import LocationList from "./components/LocationList";
import Speaker from "./components/Speaker";
import SpeakerList from "./components/SpeakerList";

import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: (
          <>
            <EventList />
            <LocationList />
            <SpeakerList />
          </>
        ),
      },
    ],
  },
  {
    path: "/edit/event/:id",
    element: <App />,
    children: [
      {
        path: "/edit/event/:id",
        element: <Event />,
      },
    ],
  },
  {
    path: "/create",
    element: <App />,
    children: [
      {
        path: "/create",
        element: <Event />,
      },
    ],
  },
  {
    path: "/locations/:id",
    element: <App />,
    children: [
      {
        path: "/locations/:id",
        element: <Location />,
      },
    ],
  },
  {
    path: "/locations",
    element: <App />,
    children: [
      {
        path: "/locations",
        element: <Location />,
      },
    ],
  },
  {
    path: "/speakers/:id",
    element: <App />,
    children: [
      {
        path: "/speakers/:id",
        element: <Speaker />,
      },
    ],
  },
  {
    path: "/speakers",
    element: <App />,
    children: [
      {
        path: "/speakers",
        element: <Speaker />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);