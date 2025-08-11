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
import ImageGallery from "./pages/ImageGallery";

//Host Imports
import HostLayout from "./pages/host/Layout";
import HostHome from "./pages/host/Home";
import HostContact from "./pages/host/Contact";
import HostCareer from "./pages/host/Career";
import HostLogin from "./pages/host/Login";
import HostSignup from "./pages/host/Signup";
import Modules from "./pages/host/Modules";
import Themes from "./pages/host/Themes";
import Capital from "./pages/host/Capital";
import HostAbout from "./pages/host/About";
import HostTermsAndConditions from "./pages/host/TermsAndConditions";
import HostPrivacy from "./pages/host/Privacy";
import HostFAQ from "./pages/host/FAQ";



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
            path: "listings/:company/images",
            element: <ImageGallery />,
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
         {
        path: "host",
        element: <HostLayout />,
        children: [
          {
            path: "",
            element: <HostHome />,
          },
          {
            path: "contact",
            element: <HostContact />,
          },
          {
            path: "career",
            element: <HostCareer />,
          },
            {
            path: "career/job/:id",
            element: <JobDetails />,
          },
          {
            path: "login",
            element: <HostLogin />,
          },
          {
            path: "signup",
            element: <HostSignup />,
          },
          {
            path: "modules",
            element: <Modules />,
          },
          {
            path: "themes",
            element: <Themes />,
          },
          {
            path: "capital",
            element: <Capital />,
          },
          {
            path: "about",
            element: <HostAbout />,
          },
          {
            path: "terms-and-conditions",
            element: <HostTermsAndConditions />,
          },
          {
            path: "privacy",
            element: <HostPrivacy />,
          },
          {
            path: "faq",
            element: <HostFAQ />,
          },
        ],
      },
    ],
  },
]);

export default router;
