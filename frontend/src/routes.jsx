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
import DestinationNews from "./pages/DestinationNews";
import LocalBlog from "./pages/LocalBlog";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ImageGallery from "./pages/ImageGallery";
import BlogDetails from "./pages/BlogDetails";

// Host imports
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
import Leads from "./pages/host/Leads";
import HostProduct from "./pages/host/Product";

// Tenant imports
import TemplateSite from "./pages/company/TemplateSite";
import TemplateHome from "./pages/company/TemplateHome";

function getTenantFromHost() {
  const hostname = window.location.hostname; // e.g. "nomad.wono.co" or "nomad.localhost"
  const rootDomain = "wono.co";

  // Case 1: main site (no subdomain or localhost root)
  if (
    hostname === rootDomain ||
    hostname === `www.${rootDomain}` ||
    hostname === "localhost" ||
    hostname.startsWith("localhost:")
  ) {
    return "main";
  }

  // Case 2: production subdomains (*.wono.co)
  if (hostname.endsWith(`.${rootDomain}`)) {
    return hostname.replace(`.${rootDomain}`, "");
  }

  // Case 3: dev subdomains (*.localhost)
  if (hostname.endsWith(".localhost")) {
    return hostname.replace(".localhost", "");
  }

  return null;
}

const tenant = getTenantFromHost();

let routerConfig = [];

if (tenant === "main") {
  // Marketing site
  routerConfig = [
    {
      path: "/",
      element: <App />,
      children: [{ path: "", index: true, element: <MainPage /> }],
    },
  ];
} else if (tenant === "nomad") {
  // Nomads subdomain
  routerConfig = [
    {
      path: "/",
      element: <NomadLayout />,
      children: [
        { path: "", element: <Home /> },
        { path: "verticals", element: <GlobalListings /> },
        { path: "listings", element: <Listings /> },
        { path: "listings/:company", element: <Product /> },
        { path: "listings/:company/images", element: <ImageGallery /> },
        { path: "components", element: <ReusableComponents /> },
        { path: "contact", element: <Contact /> },
        { path: "news", element: <DestinationNews /> },
        { path: "blog", element: <LocalBlog /> },
        { path: "blog/blog-details", element: <BlogDetails /> },
        { path: "career", element: <Career /> },
        { path: "career/job/:title", element: <JobDetails /> },
        { path: "login", element: <Login /> },
        { path: "signup", element: <Signup /> },
      ],
    },
  ];
} else if (tenant === "hosts") {
  // Hosts subdomain
  routerConfig = [
    {
      path: "/",
      element: <HostLayout />,
      children: [
        { path: "", element: <HostHome /> },
        { path: "contact", element: <HostContact /> },
        { path: "career", element: <HostCareer /> },
        { path: "career/job/:title", element: <JobDetails /> },
        { path: "login", element: <HostLogin /> },
        { path: "signup", element: <HostSignup /> },
        { path: "modules", element: <Modules /> },
        { path: "themes", element: <Themes /> },
        { path: "themes/products", element: <HostProduct /> },
        { path: "leads", element: <Leads /> },
        { path: "capital", element: <Capital /> },
        { path: "about", element: <HostAbout /> },
        { path: "terms-and-conditions", element: <HostTermsAndConditions /> },
        { path: "privacy", element: <HostPrivacy /> },
        { path: "faq", element: <HostFAQ /> },
      ],
    },
  ];
} else {
  // Company tenant subdomain
  routerConfig = [
    {
      path: "*",
      element: <TemplateSite />,
      children: [{ path: "", index: true, element: <TemplateHome /> }],
    },
  ];
}

const router = createBrowserRouter(routerConfig);

export default router;
