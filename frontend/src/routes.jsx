import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import TestingPageAllan from "./pages/TestingPageAllan";
import Buy from "./pages/Buy";
import PartnerShip from "./pages/PartnerShips";
import LoginPage from "./pages/Login";
import Contact from "./pages/Contact";
import Roi from "./pages/Roi";
import Mortgages from "./pages/Mortgages";
import Signup from "./pages/Signup";
import HowItWorks from "./pages/HowItWorks";
import RealEstate from "./pages/RealEstate";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "",
        index: true,
        element: <Home />,
      },
      {
        path: "/buy",
        element: <Buy />,
      },
      {
        path: "/partnership",
        element: <PartnerShip />,
      },
      {
        path: "/mortgage",
        element: <Mortgages />,
      },
      {
        path: "test-allan",
        element: <TestingPageAllan />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "/roi",
        element: <Roi />,
      },
      {
        path: "/how-it-works",
        element: <HowItWorks />,
      },
      {
        path: "/real-estate",
        element: <RealEstate />,
      },
      {
        path: "/faq",
        element: <FAQ />,
      },
      {
        path: "/privacy-policy",
        element: <PrivacyPolicy />,
      },
      {
        path: "/terms-conditions",
        element: <TermsConditions />,
      },
    ],
  },
]);

export default router;
