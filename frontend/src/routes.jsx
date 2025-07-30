import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import MainPage from "./pages/MainPage";
import Listings from "./pages/Listings";
import ReusableComponents from "./pages/ReusableComponents";
import NomadLayout from "./pages/NomadLayout";
import Product from "./pages/Product";

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
        ],
      },
    ],
  },
]);

export default router;
