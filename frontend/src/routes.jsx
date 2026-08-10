import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";

const lazyPage = (loader) => {
  const Component = lazy(loader);
  return (props) => (
    <Suspense fallback={null}>
      <Component {...props} />
    </Suspense>
  );
};

const DatePickerProvider = lazyPage(() => import("./components/DatePickerProvider"));
const withDatePickerProvider = (element) => (
  <DatePickerProvider>{element}</DatePickerProvider>
);

const Home = lazyPage(() => import("./pages/Home"));
const Listings = lazyPage(() => import("./pages/Listings"));
const ReusableComponents = lazyPage(() => import("./pages/ReusableComponents"));
const NomadLayout = lazyPage(() => import("./pages/NomadLayout"));
const Product = lazyPage(() => import("./pages/Product"));
const Contact = lazyPage(() => import("./pages/Contact"));
const Career = lazyPage(() => import("./pages/Career"));
const JobDetails = lazyPage(() => import("./pages/JobDetails"));
const GlobalListings = lazyPage(() => import("./pages/GlobalListings"));
const DestinationNews = lazyPage(() => import("./pages/DestinationNews"));
const LocalBlog = lazyPage(() => import("./pages/LocalBlog"));
const Login = lazyPage(() => import("./pages/Login"));
const Signup = lazyPage(() => import("./pages/Signup"));
const ImageGallery = lazyPage(() => import("./pages/ImageGallery"));
const BlogDetails = lazyPage(() => import("./pages/BlogDetails"));

const HostLayout = lazyPage(() => import("./pages/host/Layout"));
const HostHome = lazyPage(() => import("./pages/host/Home"));
const HostContact = lazyPage(() => import("./pages/host/Contact"));
const HostCareer = lazyPage(() => import("./pages/host/Career"));
const HostLogin = lazyPage(() => import("./pages/host/Login"));
const HostSignup = lazyPage(() => import("./pages/host/Signup"));
const Modules = lazyPage(() => import("./pages/host/Modules"));
const Themes = lazyPage(() => import("./pages/host/Themes"));
const Capital = lazyPage(() => import("./pages/host/Capital"));
const HostAbout = lazyPage(() => import("./pages/host/HostAbout"));
const HostTermsAndConditions = lazyPage(() =>
  import("./pages/host/TermsAndConditions"),
);
const HostPrivacy = lazyPage(() => import("./pages/host/Privacy"));
const HostFAQ = lazyPage(() => import("./pages/host/FAQ"));
const Leads = lazyPage(() => import("./pages/host/Leads"));
const HostProduct = lazyPage(() => import("./pages/host/Product"));

const TemplateSite = lazyPage(() => import("./pages/company/TemplateSite"));
const TemplateHome = lazyPage(() => import("./pages/company/TemplateHome"));
const TemplateAboutPage = lazyPage(() =>
  import("./pages/company/TemplateAboutPage"),
);
const TemplateProductsPage = lazyPage(() =>
  import("./pages/company/TemplateProductsPage"),
);
const TemplateProductDetailPage = lazyPage(() =>
  import("./pages/company/TemplateProductDetailPage"),
);
const TemplateGalleryPage = lazyPage(() =>
  import("./pages/company/TemplateGalleryPage"),
);
const TemplateTestimonialsPage = lazyPage(() =>
  import("./pages/company/TemplateTestimonialsPage"),
);
const TemplatePartnerPage = lazyPage(() =>
  import("./pages/company/TemplatePartnerPage"),
);
const TemplateCareerPage = lazyPage(() =>
  import("./pages/company/TemplateCareerPage"),
);
const TemplateContactPage = lazyPage(() =>
  import("./pages/company/TemplateContactPage"),
);
const NomadAbout = lazyPage(() => import("./pages/NomadAbout"));
const Profile = lazyPage(() => import("./pages/Profile"));
const PersistLogin = lazyPage(() => import("./layout/PersistsLogin"));
const Favorites = lazyPage(() => import("./pages/Favorites"));
const ForgotPassword = lazyPage(() => import("./pages/ForgotPassword"));
const ResetPassword = lazyPage(() => import("./pages/ResetPassword"));
const ContentAndCopyright = lazyPage(() =>
  import("./pages/host/ContentAndCopyright"),
);
const ContentUseRemoval = lazyPage(() => import("./pages/host/ContentUseRemoval"));
const NomadContentAndCopyright = lazyPage(() =>
  import("./pages/NomadContentAndCopyright"),
);
const NomadContentUseRemoval = lazyPage(() =>
  import("./pages/NomadContentUseRemoval"),
);
const NomadPrivacy = lazyPage(() => import("./pages/NomadPrivacy"));
const NomadFAQ = lazyPage(() => import("./pages/NomadFAQ"));
const NomadTermsAndConditions = lazyPage(() =>
  import("./pages/NomadTermsAndConditions"),
);
const SiteIsDown = lazyPage(() => import("./pages/SiteIsDown"));
const WebsiteUnderMaintenance = lazyPage(() =>
  import("./pages/WebsiteUnderMaintenance"),
);

const NomadAiLayout = lazyPage(() => import("./pages/NomadAiLayout"));
const AiHome = lazyPage(() => import("./pages/AiHome"));
const AiSearch = lazyPage(() => import("./pages/AiSearch"));
const AiSearchResults = lazyPage(() => import("./pages/AiSearchResults"));
const AiGlobalListings = lazyPage(() => import("./pages/AiGlobalListings"));
const AiListings = lazyPage(() => import("./pages/AiListings"));
const AiListingsListView = lazyPage(() => import("./pages/AiListingsListView"));
const AiProduct = lazyPage(() => import("./pages/AiProduct"));
const AiRestaurantProduct = lazyPage(() =>
  import("./pages/AiRestaurantProduct"),
);
const AiImageGallery = lazyPage(() => import("./pages/AiImageGallery"));
const AiWorldRankings = lazyPage(() =>
  import("./pages/AiWorldRankingsSearchResults"),
);
const AiSavingsSearch = lazyPage(() => import("./pages/AiSavingsSearch"));
const AiSavingsSearchResults = lazyPage(() =>
  import("./pages/AiSavingsSearchResults"),
);
const AiCareerSearch = lazyPage(() => import("./pages/AiCareerSearch"));
const AiCareerSearchResults = lazyPage(() =>
  import("./pages/AiCareerSearchResults"),
);
const AiCompatibleSearch = lazyPage(() => import("./pages/AiCompatibleSearch"));
const AiCompatibleSearchResults = lazyPage(() =>
  import("./pages/AiCompatibleSearchResults"),
);
const AiHomeLoggedIn = lazyPage(() => import("./pages/AiHomeLoggedIn"));
const AiLogin = lazyPage(() => import("./pages/AiLogin"));
const AiSignup = lazyPage(() => import("./pages/AiSignup"));
const AiProfile = lazyPage(() => import("./pages/AiProfile"));
const AiVisaSupport = lazyPage(() => import("./pages/AiVisaSupport"));
const AiVisaSupportThankYou = lazyPage(() =>
  import("./pages/AiVisaSupportThankYou"),
);
const AiOverallActivationSupport = lazyPage(() =>
  import("./pages/AiOverallActivationSupport"),
);
const AiNewCompanySetup = lazyPage(() => import("./pages/AiNewCompanySetup"));
const AiConsultation = lazyPage(() => import("./pages/AiConsultation"));
const AiWorkation = lazyPage(() => import("./pages/AiWorkation"));
const AiManualSearch = lazyPage(() => import("./pages/AiManualSearch"));
const AiBecomeContributor = lazyPage(() =>
  import("./pages/AiBecomeContributor"),
);
const AiBlogsFetch = lazyPage(() => import("./components/AiBlogsFetch"));
const AiNewsFetch = lazyPage(() => import("./components/AiNewsFetch"));
const AiBlogDetails = lazyPage(() => import("./pages/AiBlogDetails"));
const AiForgotPassword = lazyPage(() => import("./pages/AiForgotPassword"));
const AiVerifyForgotPasswordOtp = lazyPage(() =>
  import("./pages/AiVerifyForgotPasswordOtp"),
);
const AiResetPassword = lazyPage(() => import("./pages/AiResetPassword"));
const AiAbout = lazyPage(() => import("./pages/AiAbout"));
const AiPrivacy = lazyPage(() => import("./pages/AiPrivacy"));
const AiContact = lazyPage(() => import("./pages/AiContact"));
const AiCareer = lazyPage(() => import("./pages/AiCareer"));
const AiFAQ = lazyPage(() => import("./pages/AiFAQ"));
const AiTermsAndConditions = lazyPage(() =>
  import("./pages/AiTermsAndConditions"),
);
const AiContentAndCopyright = lazyPage(() =>
  import("./pages/AiContentAndCopyright"),
);
const AiContentUseRemoval = lazyPage(() =>
  import("./pages/AiContentUseRemoval"),
);
const AiJobDetail = lazyPage(() => import("./pages/AiJobDetail"));
const AiDestinationDetail = lazyPage(() => import("./pages/AiDestinationDetail"));

const AiHostLayout = lazyPage(() => import("./pages/AiHost/AiHostLayout"));
const AiHostHome = lazyPage(() => import("./pages/AiHost/AiHostHome"));
const AiHostProfile = lazyPage(() => import("./pages/AiHost/AiHostProfile"));
const AiHostResetPassword = lazyPage(() =>
  import("./pages/AiHost/AiHostResetPassword"),
);
const AiHostModules = lazyPage(() => import("./pages/AiHost/AiHostModules"));
const AiHostThemes = lazyPage(() => import("./pages/AiHost/AiHostThemes"));
const AiHostLeads = lazyPage(() => import("./pages/AiHost/AiHostLeads"));
const AiHostCareer = lazyPage(() => import("./pages/AiHost/AiHostCareer"));
const AiHostAbout = lazyPage(() => import("./pages/AiHost/AiHostAbout"));
const AiHostPrivacy = lazyPage(() => import("./pages/AiHost/AiHostPrivacy"));
const AiHostTermsAndCondition = lazyPage(() =>
  import("./pages/AiHost/AiHostTermAndCondition"),
);
const AiHostFAQ = lazyPage(() => import("./pages/AiHost/AiHostFAQ"));
const AiHostSignup = lazyPage(() => import("./pages/AiHost/AiHostSignup"));
const AiHostProduct = lazyPage(() => import("./pages/AiHost/AiHostProduct"));
const AiHostContact = lazyPage(() => import("./pages/AiHost/AiHostContact"));
const AiHostContentAndCopyright = lazyPage(() =>
  import("./pages/AiHost/AiHostContentAndCopyright"),
);
const AiHostContentUseRemoval = lazyPage(() =>
  import("./pages/AiHost/AiHostContentUseRemoval"),
);
const AiHostJobDetails = lazyPage(() =>
  import("./pages/AiHost/AiHostJobDetails"),
);
const AiHostModelShowcase = lazyPage(() =>
  import("./pages/AiHost/AiHostModelShowcase"),
);

function getTenantFromHost() {
  const hostname = window.location.hostname;
  const rootDomain = "wono.co";

  // Case 1: main site (no subdomain, localhost, or Vercel preview)
  if (
    hostname === rootDomain ||
    hostname === `www.${rootDomain}` ||
    hostname === "localhost" ||
    hostname.startsWith("localhost:") ||
    hostname.endsWith(".vercel.app")
  ) {
    return "main";
  }

  // Case 2: production subdomains (*.wono.co)
  if (hostname.endsWith(`.${rootDomain}`)) {
    const subdomain = hostname.replace(`.${rootDomain}`, "");
    if (subdomain === "nomad") return "main";
    return subdomain;
  }

  // Case 3: dev subdomains (*.localhost)
  if (hostname.endsWith(".localhost")) {
    const subdomain = hostname.replace(".localhost", "");
    if (subdomain === "nomad") return "main";
    return subdomain;
  }

  return null;
}

const tenant = getTenantFromHost();

let routerConfig = [];

if (tenant === "main") {
  // Main site with former nomad routes
  routerConfig = [
    {
      element: <PersistLogin />,
      children: [
        {
          element: <NomadAiLayout />,
          path: "/",
          children: [
            { index: true, element: <AiHome /> },
            { path: "login/:redirectGoal?", element: <AiLogin /> },
            { path: "signup", element: <AiSignup /> },
            { path: "forgot-password", element: <AiForgotPassword /> },
            { path: "forgot-password/verify", element: <AiVerifyForgotPasswordOtp /> },
            { path: "forgot-password/reset", element: <AiResetPassword /> },
            { path: "reset-password/:token", element: <AiResetPassword /> },
            { path: "home-logged-in", element: <AiHomeLoggedIn /> },
            { path: "search", element: <AiSearch /> },
            { path: "world-rankings", element: <AiWorldRankings /> },
            { path: "savings", element: <AiSavingsSearch /> },
            { path: "savings/results", element: <AiSavingsSearchResults /> },
            { path: "career-search", element: <AiCareerSearch /> },
            { path: "compatible", element: <AiCompatibleSearch /> },
            {
              path: "compatible/results",
              element: <AiCompatibleSearchResults />,
            },
            {
              path: "career-search/results",
              element: <AiCareerSearchResults />,
            },
            {
              path: "search/results/:loc?/:attr?",
              element: <AiSearchResults />,
            },
            {
              path: "search/:goal/results/:loc?/:attr?",
              element: <AiSearchResults />,
            },
            {
              path: "manual-search/:continent?/:country?",
              element: <AiManualSearch />,
            },
            { path: "verticals", element: <AiGlobalListings /> },
            { path: "blog", element: <AiBlogsFetch /> },
            { path: "blog/blog-details", element: <AiBlogDetails /> },
            { path: "news", element: <AiNewsFetch /> },
            { path: "news/news-details", element: <AiBlogDetails /> },
            {
              path: "events/:eventId",
              element: <AiDestinationDetail type="event" />,
            },
            {
              path: "places/:placeId",
              element: <AiDestinationDetail type="place" />,
            },
            {
              path: "restaurants/:restaurantId",
              element: withDatePickerProvider(<AiRestaurantProduct />),
            },
            {
              path: "restaurants/:restaurantId/images",
              element: <AiImageGallery />,
            },
            { path: "listings", element: <AiListings /> },
            { path: "listings-list", element: <AiListingsListView /> },
            {
              path: "listings/:company",
              element: withDatePickerProvider(<AiProduct />),
            },
            {
              path: "listings/:company/images",
              element: <AiImageGallery />,
            },
            { path: "visa-support", element: <AiVisaSupport /> },
            {
              path: "visa-support/thank-you",
              element: <AiVisaSupportThankYou />,
            },
            {
              path: "overall-activation-support",
              element: <AiOverallActivationSupport />,
            },
            {
              path: "new-company-setup",
              element: withDatePickerProvider(<AiNewCompanySetup />),
            },
            {
              path: "consultation",
              element: withDatePickerProvider(<AiConsultation />),
            },
            {
              path: "workation",
              element: withDatePickerProvider(<AiWorkation />),
            },
            { path: "profile", element: <AiProfile /> },
            {
              path: "become-a-contributor",
              element: <AiBecomeContributor />,
            },
            {
              path: "about",
              element: <AiAbout />,
            },
            {
              path: "privacy",
              element: <AiPrivacy />,
            },
            {
              path: "contact",
              element: <AiContact />,
            },
            {
              path: "career",
              element: <AiCareer />,
            },
            {
              path: "career/job/:title",
              element: withDatePickerProvider(<AiJobDetail />),
            },
            {
              path: "faq",
              element: <AiFAQ />,
            },
            {
              path: "terms-and-conditions",
              element: <AiTermsAndConditions />,
            },
            {
              path: "content-and-copyright",
              element: <AiContentAndCopyright />,
            },
            {
              path: "content-use-removal",
              element: <AiContentUseRemoval />,
            },
            { path: "site-is-down", element: <SiteIsDown /> },
            {
              path: "website-under-maintenance",
              element: <WebsiteUnderMaintenance />,
            },
          ],
        },
        {
          element: <NomadLayout />,
          path: "/old",
          children: [
            { path: "home", element: <Home /> },

            { path: "verticals", element: <GlobalListings /> },
            { path: "listings", element: <Listings /> },
            {
              path: "listings/:company",
              element: withDatePickerProvider(<Product />),
            },
            { path: "listings/:company/images", element: <ImageGallery /> },
            { path: "components", element: <ReusableComponents /> },
            { path: "contact", element: <Contact /> },
            { path: "news", element: <DestinationNews /> },
            { path: "news/news-details", element: <BlogDetails /> },
            { path: "blog", element: <LocalBlog /> },
            { path: "blog/blog-details", element: <BlogDetails /> },
            { path: "career", element: <Career /> },
            {
              path: "career/job/:title",
              element: withDatePickerProvider(<JobDetails />),
            },
            { path: "login", element: <Login /> },
            { path: "forgot-password", element: <ForgotPassword /> },
            { path: "reset-password/:token", element: <ResetPassword /> },
            { path: "signup", element: <Signup /> },
            { path: "about", element: <NomadAbout /> },
            {
              path: "terms-and-conditions",
              element: <NomadTermsAndConditions />,
            },
            {
              path: "content-and-copyright",
              element: <NomadContentAndCopyright />,
            },
            {
              path: "content-use-removal",
              element: <NomadContentUseRemoval />,
            },
            { path: "privacy", element: <NomadPrivacy /> },
            { path: "faq", element: <NomadFAQ /> },
            { path: "profile", element: <Profile /> },
            { path: "favorites", element: <Favorites /> },
          ],
        },
        // {
        //   path: "/",
        //   element: <App />,
        //   children: [
        //     { path: "", index: true, element: <MainPage /> },
        //     { path: "site-is-down", element: <SiteIsDown /> },
        //     {
        //       path: "website-under-maintenance",
        //       element: <WebsiteUnderMaintenance />,
        //     },
        //   ],
        // },
      ],
    },
  ];
/*
} else if (tenant === "nomad") {
  console.log("nomad routes");
  // Nomads subdomain
  routerConfig = [
    {
      element: <PersistLogin />,
      children: [
        {
          element: <NomadAiLayout />,
          path: "/",
          children: [
            { index: true, element: <AiHome /> },
            { path: "login/:redirectGoal?", element: <AiLogin /> },
            { path: "signup", element: <AiSignup /> },
            { path: "forgot-password", element: <AiForgotPassword /> },
            { path: "forgot-password/verify", element: <AiVerifyForgotPasswordOtp /> },
            { path: "forgot-password/reset", element: <AiResetPassword /> },
            { path: "reset-password/:token", element: <AiResetPassword /> },
            { path: "home-logged-in", element: <AiHomeLoggedIn /> },
            { path: "search", element: <AiSearch /> },
            { path: "world-rankings", element: <AiWorldRankings /> },
            { path: "savings", element: <AiSavingsSearch /> },
            { path: "savings/results", element: <AiSavingsSearchResults /> },
            { path: "career-search", element: <AiCareerSearch /> },
            { path: "compatible", element: <AiCompatibleSearch /> },
            {
              path: "compatible/results",
              element: <AiCompatibleSearchResults />,
            },
            {
              path: "career-search/results",
              element: <AiCareerSearchResults />,
            },
            {
              path: "search/results/:loc?/:attr?",
              element: <AiSearchResults />,
            },
            {
              path: "search/:goal/results/:loc?/:attr?",
              element: <AiSearchResults />,
            },
            {
              path: "manual-search/:continent?/:country?",
              element: <AiManualSearch />,
            },
            { path: "verticals", element: <AiGlobalListings /> },
            { path: "blog", element: <AiBlogsFetch /> },
            { path: "blog/blog-details", element: <AiBlogDetails /> },
            { path: "news", element: <AiNewsFetch /> },
            { path: "news/news-details", element: <AiBlogDetails /> },
            {
              path: "events/:eventId",
              element: <AiDestinationDetail type="event" />,
            },
            {
              path: "places/:placeId",
              element: <AiDestinationDetail type="place" />,
            },
            {
              path: "restaurants/:restaurantId",
              element: withDatePickerProvider(<AiRestaurantProduct />),
            },
            {
              path: "restaurants/:restaurantId/images",
              element: <AiImageGallery />,
            },
            { path: "listings", element: <AiListings /> },
            { path: "listings-list", element: <AiListingsListView /> },
            {
              path: "listings/:company",
              element: withDatePickerProvider(<AiProduct />),
            },
            {
              path: "listings/:company/images",
              element: <AiImageGallery />,
            },
            { path: "visa-support", element: <AiVisaSupport /> },
            {
              path: "visa-support/thank-you",
              element: <AiVisaSupportThankYou />,
            },
            {
              path: "overall-activation-support",
              element: <AiOverallActivationSupport />,
            },
            {
              path: "new-company-setup",
              element: withDatePickerProvider(<AiNewCompanySetup />),
            },
            {
              path: "consultation",
              element: withDatePickerProvider(<AiConsultation />),
            },
            {
              path: "workation",
              element: withDatePickerProvider(<AiWorkation />),
            },
            { path: "profile", element: <AiProfile /> },
            {
              path: "become-a-contributor",
              element: <AiBecomeContributor />,
            },
            {
              path: "about",
              element: <AiAbout />,
            },
            {
              path: "privacy",
              element: <AiPrivacy />,
            },
            {
              path: "contact",
              element: <AiContact />,
            },
            {
              path: "career",
              element: <AiCareer />,
            },
            {
              path: "career/job/:title",
              element: <AiJobDetail />,
            },
            {
              path: "faq",
              element: <AiFAQ />,
            },
            {
              path: "terms-and-conditions",
              element: <AiTermsAndConditions />,
            },
            {
              path: "content-and-copyright",
              element: <AiContentAndCopyright />,
            },
            {
              path: "content-use-removal",
              element: <AiContentUseRemoval />,
            },
          ],
        },
        {
          element: <NomadLayout />,
          path: "/old",
          children: [
            { path: "home", element: <Home /> },

            { path: "verticals", element: <GlobalListings /> },
            { path: "listings", element: <Listings /> },
            {
              path: "listings/:company",
              element: withDatePickerProvider(<Product />),
            },
            { path: "listings/:company/images", element: <ImageGallery /> },
            { path: "components", element: <ReusableComponents /> },
            { path: "contact", element: <Contact /> },
            { path: "news", element: <DestinationNews /> },
            { path: "news/news-details", element: <BlogDetails /> },
            { path: "blog", element: <LocalBlog /> },
            { path: "blog/blog-details", element: <BlogDetails /> },
            { path: "career", element: <Career /> },
            {
              path: "career/job/:title",
              element: withDatePickerProvider(<JobDetails />),
            },
            { path: "login", element: <Login /> },
            { path: "forgot-password", element: <ForgotPassword /> },
            { path: "reset-password/:token", element: <ResetPassword /> },
            { path: "signup", element: <Signup /> },
            { path: "about", element: <NomadAbout /> },
            {
              path: "terms-and-conditions",
              element: <NomadTermsAndConditions />,
            },
            {
              path: "content-and-copyright",
              element: <NomadContentAndCopyright />,
            },
            {
              path: "content-use-removal",
              element: <NomadContentUseRemoval />,
            },
            { path: "privacy", element: <NomadPrivacy /> },
            { path: "faq", element: <NomadFAQ /> },
            { path: "profile", element: <Profile /> },
            { path: "favorites", element: <Favorites /> },
          ],
        },
        // {
        //   element: <AiHostLayout />,
        //   path: "/host",
        //   children: [
        //     { path: "", element: <AiHostHome /> },
        //     { path: "profile", element: <AiHostProfile /> },
        //     {
        //       path: "reset-password/:token",
        //       element: <AiHostResetPassword />,
        //     },
        //     { path: "signup", element: <AiHostSignup /> },
        //     { path: "product", element: <AiHostProduct /> },
        //     { path: "modules", element: <AiHostModules /> },
        //     { path: "themes", element: <AiHostThemes /> },
        //     { path: "leads", element: <AiHostLeads /> },
        //     { path: "career", element: <AiHostCareer /> },
        //     {
        //       path: "career/job/:title",
        //       element: <AiHostJobDetails />,
        //     },
        //     { path: "about", element: <AiHostAbout /> },
        //     { path: "privacy", element: <AiHostPrivacy /> },
        //     {
        //       path: "terms-and-conditions",
        //       element: <AiHostTermsAndCondition />,
        //     },
        //     { path: "faq", element: <AiHostFAQ /> },
        //     { path: "contact", element: <AiHostContact /> },
        //     {
        //       path: "content-and-copyright",
        //       element: <AiHostContentAndCopyright />,
        //     },
        //     {
        //       path: "content-use-removal",
        //       element: <AiHostContentUseRemoval />,
        //     },
        //     {
        //       path: "model-showcase",
        //       element: <AiHostModelShowcase />,
        //     },
        //   ],
        // },
      ],
    },
  ];
*/
} else if (tenant === "host") {
  // Hosts subdomain
  routerConfig = [
    {
      element: <PersistLogin />,
      children: [
        {
          element: <AiHostLayout />,
          path: "/",
          children: [
            { path: "", element: <AiHostHome /> },
            { path: "profile", element: <AiHostProfile /> },
            {
              path: "reset-password/:token",
              element: <AiHostResetPassword />,
            },
            { path: "signup", element: <AiHostSignup /> },
            { path: "product", element: <AiHostProduct /> },
            { path: "modules", element: <AiHostModules /> },
            { path: "themes", element: <AiHostThemes /> },
            { path: "leads", element: <AiHostLeads /> },
            { path: "career", element: <AiHostCareer /> },
            {
              path: "career/job/:title",
              element: withDatePickerProvider(<AiHostJobDetails />),
            },
            { path: "about", element: <AiHostAbout /> },
            { path: "privacy", element: <AiHostPrivacy /> },
            {
              path: "terms-and-conditions",
              element: <AiHostTermsAndCondition />,
            },
            { path: "faq", element: <AiHostFAQ /> },
            { path: "contact", element: <AiHostContact /> },
            {
              path: "content-and-copyright",
              element: <AiHostContentAndCopyright />,
            },
            {
              path: "content-use-removal",
              element: <AiHostContentUseRemoval />,
            },
            {
              path: "model-showcase",
              element: <AiHostModelShowcase />,
            },
          ],
        },
        {
          path: "/hostold",
          element: <HostLayout />,
          children: [
            { path: "", element: <HostHome /> },
            { path: "contact", element: <HostContact /> },
            { path: "career", element: <HostCareer /> },
            {
              path: "career/job/:title",
              element: withDatePickerProvider(<JobDetails />),
            },
            { path: "login", element: <HostLogin /> },
            { path: "signup", element: <HostSignup /> },
            { path: "modules", element: <Modules /> },
            { path: "themes", element: <Themes /> },
            { path: "themes/products", element: <HostProduct /> },
            { path: "leads", element: <Leads /> },
            { path: "capital", element: <Capital /> },
            { path: "about", element: <HostAbout /> },
            {
              path: "terms-and-conditions",
              element: <HostTermsAndConditions />,
            },
            {
              path: "content-and-copyright",
              element: <ContentAndCopyright />,
            },
            { path: "content-use-removal", element: <ContentUseRemoval /> },
            { path: "privacy", element: <HostPrivacy /> },
            { path: "faq", element: <HostFAQ /> },
          ],
        },
      ],
    },
  ];
} else {
  // Company tenant subdomain
  routerConfig = [
    {
      path: "/",
      element: <TemplateSite />,
      children: [
        { path: "", index: true, element: <TemplateHome /> },
        { path: "page/home", element: <TemplateHome /> },
        { path: "about", element: <TemplateAboutPage /> },
        { path: "page/about", element: <TemplateAboutPage /> },
        { path: "products", element: <TemplateProductsPage /> },
        { path: "page/products", element: <TemplateProductsPage /> },
        {
          path: "products/:slug",
          element: withDatePickerProvider(<TemplateProductDetailPage />),
        },
        {
          path: "page/products/:slug",
          element: withDatePickerProvider(<TemplateProductDetailPage />),
        },
        {
          path: "products/:slug/:itemSlug",
          element: withDatePickerProvider(<TemplateProductDetailPage />),
        },
        {
          path: "page/products/:slug/:itemSlug",
          element: withDatePickerProvider(<TemplateProductDetailPage />),
        },
        { path: "gallery", element: <TemplateGalleryPage /> },
        { path: "page/gallery", element: <TemplateGalleryPage /> },
        { path: "testimonials", element: <TemplateTestimonialsPage /> },
        { path: "page/testimonials", element: <TemplateTestimonialsPage /> },
        { path: "partner", element: <TemplatePartnerPage /> },
        { path: "page/partner", element: <TemplatePartnerPage /> },
        { path: "careers", element: <TemplateCareerPage /> },
        { path: "careers/:jobCode", element: <TemplateCareerPage /> },
        { path: "page/careers", element: <TemplateCareerPage /> },
        { path: "page/careers/:jobCode", element: <TemplateCareerPage /> },
        { path: "contact", element: <TemplateContactPage /> },
        { path: "page/contact", element: <TemplateContactPage /> },
      ],
    },
  ];
}

const router = createBrowserRouter(routerConfig, {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
});

export default router;
