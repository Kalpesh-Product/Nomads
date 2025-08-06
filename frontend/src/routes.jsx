import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import MainPage from "./pages/MainPage";
import Listings from "./pages/Listings";
import ReusableComponents from "./pages/ReusableComponents";
import NomadLayout from "./pages/NomadLayout";
import Product from "./pages/Product";
import Contact from "./pages/Contact";
import Career from "./pages/Career";
import JobDetails from "./pages/JobDetails";
import GlobalListings from "./pages/GlobalListings";
import GlobalListingsMap from "./pages/GlobalListingsMap";
import DestinationNews from "./pages/DestinationNews";
import LocalBlog from "./pages/LocalBlog";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        index: true,
        element: <MainPage />,
      },
      {
        path: "nomad",
        element: <NomadLayout />,
        children: [
          {
            path: "",
            element: <Home />,
          },
          {
            path: ":country/:state",
            element: <GlobalListings />,
          },

          {
            path: "listings",
            element: <Listings />,
          },
          {
            path: "listings/:company",
            element: <Product />,
          },
          {
            path: "components",
            element: <ReusableComponents />,
          },
          {
            path: "contact",
            element: <Contact />,
          },
          {
            path: "destination-news",
            element: <DestinationNews />,
          },
          {
            path: "local-blog",
            element: <LocalBlog />,
          },
          {
            path: "career",
            element: <Career />,
          },
          {
            path: "career/job/:id",
            element: <JobDetails />,
          },
          {
            path: "login",
            element: <Login />,
          },
          {
            path: "signup",
            element: <Signup />,
          },
        ],
      },
    ],
  },
]);

export default router;
