import React from "react";
import Container from "../../components/Container";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import RotatingGlobe from "../../components/RotatingGlobe";
import images from "../../assets/images";
import FeatureCard from "../../components/FeatureCard";
import { ReactFitty } from "react-fitty";
import GetStartedButton from "../../components/GetStartedButton";
import { NavLink, useNavigate } from "react-router-dom";
import MySeperator from "../../components/MySeperator";
import AiHome from "../AiHome";
import AiHostPricing from "./AiHostPricing";
import {
  TbFileDescription,
  TbLayoutDashboard,
  TbWorldWww,
} from "react-icons/tb";

const HostHome = () => {
  // mobile screen for globe responsiveness
  const ismobile = window.innerWidth < 769;
  const isTablet = window.innerWidth < 1025;
  const isLaptop = window.innerWidth < 1441;
  const navigate = useNavigate();
  const amenities = [
    // Group 1
    { id: 1, title: "No Code Website", icon: images.website },
    { id: 11, title: "Booking Engine", icon: images.bookingsSaas }, // using bookingsSaas as booking engine
    { id: 2, title: "Payment Gateway", icon: images.paymentGateway },
    { id: 5, title: "Leads Management", icon: images.leadGenerationSM },
    { id: 27, title: "AI SEO", icon: images.automatedSeoSM },
    { id: 23, title: "Notifications", icon: images.notifications },

    // Group 2
    { id: 25, title: "Tickets", icon: images.ticketRaisingCM },
    { id: 20, title: "Tasks", icon: images.taskManagementHR },
    { id: 7, title: "Meeting Rooms", icon: images.meetingRoomsCM },
    { id: 21, title: "Visitors", icon: images.visitorCM },
    { id: 19, title: "Assets", icon: images.eSignHR },
    { id: 22, title: "Calendar", icon: images.calendar },

    // Group 3
    { id: 4, title: "Sales", icon: images.sales },
    { id: 3, title: "Finance", icon: images.financialReportsFA },
    { id: 12, title: "Human Resource", icon: images.employeeReportsRA },
    { id: 18, title: "IT", icon: images.fullDataAnalysisRA },
    {
      id: 28,
      title: "Maintenance",
      icon: images.maintenanceCM || images.assets,
    }, // fallback if no icon exists
    { id: 17, title: "Admin", icon: images.customerProfile },

    // Group 4
    { id: 29, title: "Customer Service", icon: images.customerService },
    { id: 15, title: "Marketing", icon: images.smsMarketingSM },
    { id: 10, title: "Cafe", icon: images.cafeOrdersCM },
    { id: 9, title: "Events", icon: images.events },
    { id: 24, title: "Profile", icon: images.customerProfile },
    { id: 26, title: "Analytics", icon: images.analyticsCM },
  ];
  const onePartner = [
    {
      id: 1,
      title: "Global Bookings",
      description:
        "Become a globally acceptable business where customers can book  your offerings seamlessly and with great experience",
    },
    {
      id: 2,
      title: "Systems & Processes",
      description:
        "Our SaaS platform has everything covered for your business requirements and we customize ourselves as per your needs.",
    },
    {
      id: 3,
      title: "Growth & Revenues",
      description:
        "Our approach is based on data and analytics to help you make decisions which will grow your business without employee dependency.",
    },
  ];
  const noCode = [
    { id: 1, image: "/hosts/themes/cafe.webp", label: "Cafe" },
    { id: 2, image: "/hosts/themes/coworking.png", label: "Co-Working" },
    { id: 3, image: "/hosts/themes/coliving.png", label: "Co-Living" },
    { id: 4, image: "/hosts/themes/boutique.png", label: "Boutique" },
  ];
  return (
    <main>
      <AiHostPricing />
      <Container padding={false}>
        <section className="pb-4 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                id: 1,
                title: "MODULES",
                icon: TbWorldWww,
                route: "/ai-host-modules",
              },
              {
                id: 2,
                title: "LEADS",
                icon: TbFileDescription,
                route: "/ai-host-leads",
              },
              {
                id: 3,
                title: "THEMES",
                icon: TbLayoutDashboard,
                route: "/ai-host-themes",
              },
            ].map((tab) => {
              const Icon = tab.icon;

              return (
                <div
                  key={tab.id}
                  onClick={() => navigate(tab.route)}
                  className="group cursor-pointer rounded-2xl bg-[#f1f1f3] px-6 py-5 text-center shadow-[0_1px_0_rgba(255,255,255,0.7)] transition-colors duration-200 hover:bg-sky-500"
                >
                  <div className="mx-auto grid w-fit grid-cols-[24px_auto] items-center gap-3 text-left">
                    <Icon
                      size={24}
                      strokeWidth={2.2}
                      aria-hidden="true"
                      className="shrink-0 text-black/90 transition-colors duration-200 group-hover:text-white"
                    />
                    <h3 className="text-nano font-bold uppercase leading-tight text-black/90 transition-colors duration-200 group-hover:text-white sm:text-[0.8rem] pl-5">
                      {tab.title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </Container>
      {/* Key Modules */}
      <Container>
        <section className="space-y-2">
          <div>
            <h1 className="text-[clamp(1.2rem,2.9vw,7rem)] font-semibold text-center text-secondary-dark">
              KEY MODULES FOR YOUR BUSINESS
            </h1>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {amenities.map((item) => (
              <FeatureCard key={item.id} icon={item.icon} title={item.title} />
            ))}
          </div>
        </section>
      </Container>
      {/* Key Modules */}
      <Container padding={false}>
        <hr className="border-t-4 border-gray-300" />
      </Container>
      <section>
        <Container padding={false}>
          <div className="flex flex-col gap-6 lg:pt-16 lg:pb-8 pb-10 pt-10">
            <div className="flex flex-col leading-tight">
              <ReactFitty>
                <h1 className="font-semibold uppercase">
                  One Partner Platform
                </h1>
              </ReactFitty>
              <ReactFitty>
                <p className="font-semibold uppercase">
                  Infinite possibilities and opportunities!
                </p>
              </ReactFitty>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {onePartner.map((item) => (
                <div
                  key={item.id}
                  className="border-t-2 border-black w-full space-y-2 pt-2 pb-0"
                >
                  <h1 className="text-title py-3">
                    {item.title || "Title here"}
                  </h1>
                  <span className="text-secondary-dark">
                    {item.description || "Description here"}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-row items-center justify-center pt-2 pb-0 lg:justify-end">
              <GetStartedButton
                title={"GET STARTED"}
                handleSubmit={() => navigate("/ai-host-signup?step=1")}
              />
            </div>
          </div>
        </Container>
      </section>
      <MySeperator />
      <section className="">
        <Container padding={false}>
          <div className="flex flex-col leading-tight lg:pt-16 lg:pb-8 pt-10 pb-10">
            <ReactFitty>
              <h1 className="font-semibold uppercase">NO CODE SELF SERVE</h1>
            </ReactFitty>
            <ReactFitty>
              <p className="font-semibold uppercase">
                TRANSACTIONAL WEBSITE & MOBILE SITE
              </p>
            </ReactFitty>
            <p className="text-[clamp(1rem,1.5vw,3rem)] my-4 lg:my-4">
              Free customizable website templates which are strategically
              tailored for managing Lifestyle Businesses like Co-Working,
              Co-Living, Hostels, Boutique Properties, Cafes etc
            </p>
            <div className="flex lg:grid lg:grid-cols-2 gap-4 my-4 overflow-x-auto scrollbar-hide">
              {noCode.map((item) => (
                <div
                  key={item.id}
                  className="h-full w-full lg:w-auto flex-shrink-0 md:w-80 overflow-hidden rounded-lg shadow-lg"
                >
                  <img
                    src={item.image || "/hosts/themes/cafe.webp"}
                    className="h-full w-full object-cover"
                    alt={item.label || "image"}
                  />
                </div>
              ))}
            </div>
            <div className="text-center my-4">
              <NavLink
                to={"/ai-host-themes"}
                className={" hover:underline hover:text-primary-blue"}
              >
                View more
              </NavLink>
            </div>
          </div>
        </Container>
      </section>
      <MySeperator />
      <div className="flex w-full flex-col items-center justify-center pt-8 pb-0">
        <div className="text-[clamp(1.2rem,2.8vw,7rem)] font-semibold text-center text-secondary-dark">
          ACTIVATE YOUR MODERN NOMAD BUSINESS NOW.
        </div>
        <div className="justify-center pb-4 pt-4">
          <GetStartedButton
            title={"Get Started"}
            handleSubmit={() => navigate("/ai-host-signup?step=1")}
          />
        </div>
      </div>
      {/* <MySeperator /> */}
    </main>
  );
};

export default HostHome;
