import React, { useState } from "react";
import {
  FaRegCircleCheck,
  FaGaugeSimpleHigh,
  FaRegClock,
  FaImages,
  FaWindowMaximize,
  FaRegIdCard,
} from "react-icons/fa6";
import { useLocation } from "react-router-dom";
import GetStartedButton from "../../components/GetStartedButton";
import { ReactFitty } from "react-fitty";

const features = [
  "No Code Website",
  "Booking Engine",
  "Payment Gateway",
  "Leads Management",
  "AI SEO",
  "Notifications",
];

const perks = [
  {
    icon: <FaRegCircleCheck />,
    title: "Works with latest wono changes",
    description:
      "Themes on the Wono Theme Store are guaranteed to stay up to date and work with Wono's ever-growing feature set.",
  },
  {
    icon: <FaGaugeSimpleHigh />,
    title: "Speed tested and approved",
    description:
      "Every theme in the Theme Store meets Wono's performance standards, ensuring a faster shopping experience for your buyers.",
  },
  {
    icon: <FaRegClock />,
    title: "Unlimited free trial",
    description:
      "Try the theme for free with your own products, brand colors, and customizations. One-time payment of $300 if you publish the theme to your store.",
  },
  {
    icon: <FaImages />,
    title: "Free high resolution photos",
    description:
      "Demo stores aren't included, but you can get free stock photos from Wono Burst.",
  },
  {
    icon: <FaWindowMaximize />,
    title: "Free theme updates",
    description:
      "Get the latest theme features and fixes from the Theme Store. You can redownload your purchase at any time.",
  },
  {
    icon: <FaRegIdCard />,
    title: "Non-expiring license for one store",
    description:
      "Your payment entitles you to use the theme on a single store, and keep it as long as you like.",
  },
];

const themes = [
  {
    src: "/hosts/themes/biznest.png",
    mockup: "/hosts/themes/biznestProduct.png",
    alt: "BiznestImage",
    tag: "co-working",
  },
  {
    src: "/hosts/themes/coworkingMewo.png",
    mockup: "/hosts/themes/coworkingMewoProduct.png",
    alt: "CoWorkingMewo",
    tag: "co-working",
  },
  {
    src: "/hosts/themes/coworking.png",
    mockup: "/hosts/themes/coworkingProduct.png",
    alt: "Co-Working Image",
    tag: "co-working",
  },
  {
    src: "/hosts/themes/boutique.png",
    // mockup: BoutiqueMockup,
    alt: "Boutique Image",
    tag: "boutique",
  },
];

const HostProduct = () => {
  const { state } = useLocation();
  const initialImage = state.image;
  const [selectedImage, setSelectedImage] = useState(initialImage);

  return (
    <div className="flex flex-col gap-8">
      <section className="w-full bg-black text-white flex flex-col justify-center items-center gap-8 py-8 h-[80%]">
        <div className="flex justify-around">
          <div className="flex flex-col gap-10 justify-center">
            <h1 className="text-hero font-semibold">INCLUSIONS</h1>
            <ul className="flex flex-col gap-2 ">
              {features.map((feat) => (
                <li className="flex gap-2 text-subtitle">
                  <span className="text-[#0AA9EF] font-bold">
                    ✔&nbsp;&nbsp;
                  </span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
            <GetStartedButton externalStyles={"bg-white text-black"} />
          </div>
          <div
            data-aos="fade-up"
            className="w-[50%] h-[50%] overflow-hidden rounded-xl"
          >
            <img
              className="rounded-xl w-full h-full object-cover"
              src={selectedImage.src}
              alt={selectedImage.alt}
            />
          </div>
        </div>
      </section>
      <section className="grid grid-cols-3 gap-12 px-28 py-6">
        <div className="text-hero col-span-1">
          <h1>
            Built with confidence — <br />
            The theme store promise
          </h1>
        </div>
        <div className="col-span-2">
          <div className="grid grid-cols-2 gap-8">
            {perks.map((perk) => (
              <div className="flex gap-2 items-start">
                <div className="text-content mt-1">{perk.icon}</div>
                <div className="flex flex-col gap-2">
                  <h2 className="font-bold">{perk.title}</h2>
                  <span className="text-content">{perk.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="w-full bg-[#E9F9FF] flex flex-col justify-center items-center gap-8 py-8 h-[80%] px-28">
        <ReactFitty>Few more suggestions for you</ReactFitty>

        <div className="grid grid-cols-2 justify-between gap-8">
          {themes.map((theme) => (
            <div className="w-full h-full overflow-hidden rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.5)] cursor-pointer">
              <img
                src={theme.src}
                alt={theme.alt}
                className="w-full h-full object-cover hover:scale-[1.2] transition-transform duration-500 ease"
              />
            </div>
          ))}
        </div>
        <GetStartedButton />
      </section>
    </div>
  );
};

export default HostProduct;
