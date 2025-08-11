import { Container } from "@mui/material";
import React from "react";
import BiznestImage from "../../../public/hosts/themes/biznest.png";
import CoWorkingMewo from "../../../public/hosts/themes/coWorkingMewo.png";
import CoWorkingImage from "../../../public/hosts/themes/coworking.png";
import Boutique from "../../../public/hosts/themes/boutique.png";
import CoLivingImage from "../../../public/hosts/themes/coliving.png";
import CoWorkingImage_2 from "../../../public/hosts/themes/coworking2.png";
import CoWorkingImage_3 from "../../../public/hosts/themes/coworking3.png";
import Cafe_2 from "../../../public/hosts/themes/cafe2.png";
import Cafe_3 from "../../../public/hosts/themes/cafe3.png";
import Hostels from "../../../public/hosts/themes/hostels.png";
import GetStartedButton from "../../components/GetStartedButton";

const themes = [
  {
    src: BiznestImage,
    // mockup: BiznestImageMockup,
    alt: "BiznestImage",
    tag: "co-working",
  },
  {
    src: CoWorkingMewo,
    // mockup: CoWorkingMewoMockup,
    alt: "CoWorkingMewo",
    tag: "co-working",
  },
  {
    src: CoWorkingImage,
    // mockup: CoWorkingImageMockup,
    alt: "Co-Working Image",
    tag: "co-working",
  },
  {
    src: Boutique,
    // mockup: BoutiqueMockup,
    alt: "Boutique Image",
    tag: "boutique",
  },
  {
    src: CoLivingImage,
    // mockup: CoLivingImageMockup,
    alt: "Co-Living Image",
    tag: "co-living",
  },
  {
    src: CoWorkingImage_2,
    // mockup: CoWorkingNomad,
    alt: "CoLivingImage_2",
    tag: "co-working",
  },
  {
    src: CoWorkingImage_3,
    // mockup: CoWorkingImage_3_Mockup,
    alt: "CoLivingImage_3",
    tag: "co-working",
  },
  {
    src: Cafe_2,
    // mockup: Cafe2Mockup,
    alt: "Cafe_2",
    tag: "cafe",
  },
  {
    src: Cafe_3,
    //  mockup: Cafe3Mockup,
    alt: "Cafe_3",
    tag: "cafe",
  },
  {
    src: Hostels,
    // mockup: Hostels_mockup,
    alt: "Hostels",
    tag: "hostels",
  },
];
const Themes = () => {
  return (
    <div className="w-70 flex flex-col gap-8 text-secondary-dark justify-center items-center">
      <div className="flex flex-col items-end justify-center gap-4 text-[clamp(1rem,13.71vw,4rem)] leading-[1.3] font-[500] text-secondary-dark px-28">
        <h1>Choose the best Responsive Website Theme for your business</h1>

        <GetStartedButton
          title={"Get Started"}
        />
      </div>

      {/*Top Recommendations */}
      <div className="w-full bg-gray-100 flex flex-col justify-center items-center gap-8 py-8">
        <div className="px-28">
          <h1 className="text-[2.5rem] font-semibold pb-2">
            Top Theme Recommendations
          </h1>
          <span className="text-[1.8rem]">
            Cherry pick features or ask us to customize anything for your
            business growth. Fully tech ready, integrated and responsive.
          </span>
        </div>
        <div className="grid grid-cols-2 px-28 gap-10">
          {themes.map((image, index) => (
            <div data-aos="fade-up" className="w-full h-full overflow-hidden rounded-xl" key={index}>
              <img
                className="rounded-xl w-full h-full object-cover transition-transform duration-500 ease hover:scale-[1.2] cursor-pointer origin-center"
                onClick={() => {
                  // navigate("/themes/products", { state: { image } });
                  window.scrollTo({ top: 0, behavior: "instant" });
                }}
                src={image.src}
                alt={image.alt}
              />
            </div>
          ))}
        </div>
        <GetStartedButton
          title={"Get Started"}
        />
      </div>
    </div>
  );
};

export default Themes;
