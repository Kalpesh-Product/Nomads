import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import Listings from "./pages/Listings";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        index: true,
        element: <Home />,
      },
      {
        path: "/listings",
        element: <Listings />,
      },
    ],
  },
]);

export default router;
