import GetStartedButton from "../../components/GetStartedButton";

const themes = [
  {
    src: "/hosts/themes/biznest.png",
    // mockup: BiznestImageMockup,
    alt: "BiznestImage",
    tag: "co-working",
  },
  {
    src: "/hosts/themes/coworkingMewo.png",
    // mockup: CoWorkingMewoMockup,
    alt: "CoWorkingMewo",
    tag: "co-working",
  },
  {
    src: "/hosts/themes/coworking.png",
    // mockup: CoWorkingImageMockup,
    alt: "Co-Working Image",
    tag: "co-working",
  },
  {
    src: "/hosts/themes/boutique.png",
    // mockup: BoutiqueMockup,
    alt: "Boutique Image",
    tag: "boutique",
  },
  {
    src: "/hosts/themes/coliving.png",
    // mockup: CoLivingImageMockup,
    alt: "Co-Living Image",
    tag: "co-living",
  },
  {
    src: "/hosts/themes/coworking2.png",
    // mockup: CoWorkingNomad,
    alt: "CoLivingImage_2",
    tag: "co-working",
  },
  {
    src: "/hosts/themes/coworking3.png",
    // mockup: CoWorkingImage_3_Mockup,
    alt: "CoLivingImage_3",
    tag: "co-working",
  },
  {
    src: "/hosts/themes/cafe2.png",
    // mockup: Cafe2Mockup,
    alt: "Cafe_2",
    tag: "cafe",
  },
  {
    src: "/hosts/themes/cafe3.png",
    //  mockup: Cafe3Mockup,
    alt: "Cafe_3",
    tag: "cafe",
  },
  {
    src: "/hosts/themes/hostels.png",
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

      {/*Customize */}
      <div className="flex ">
         <h1>Customize it your way</h1>
      </div>

    </div>
  );
};

export default Themes;
