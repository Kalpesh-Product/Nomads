import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GetStartedButton from "../../components/GetStartedButton";
import Container from "../../components/Container";
import MySeperator from "../../components/MySeperator";
import { VERTICAL_TEMPLATE_CATALOG, VERTICAL_FILTERS } from "../../constants/verticalTemplateCatalog";

const themeWebsiteGridData = [
  {
    title: "Faster loading",
    description: "WoNo is designed for performance so your site loads faster",
  },
  {
    title: "Built with SEO in mind",
    description:
      "Get the SEO capabilities you need to optimize your site for search visibility.",
  },
  {
    title: "Enterprise-grade security",
    description: "We keep your site and visitors data protected, 24/7.",
  },
  {
    title: "Resilient infrastructure",
    description:
      "Multi-cloud hosting ensures 99.9% uptime, even during traffic spikes.",
  },
  {
    title: "Accessible for everyone",
    description:
      "Make your own website inclusive with built-in accessibility tools.",
  },
  {
    title: "Easy customization",
    description:
      "Personalize your website effortlessly by using  customizable templates.",
  },
];

const supportItems = [
  {
    title: "Get answers",
    description:
      "Watch tutorials and read detailed articles in Wono help center",
    linkText: "Go to FAQ →",
    path: "/faq",
  },
  {
    title: "Contact Us",
    description:
      "Get support by chat or schedule a call with a Customer Care Expert",
    linkText: "Connect With us →",
    path: "/contact",
  },
  {
    title: "Hire a pro",
    description: "Get help at any stage -- from site creation to online growth",
    linkText: "Browse all services →",
    path: "/modules",
  },
];

const Themes = () => {
  const navigate = useNavigate();
  const [verticalFilter, setVerticalFilter] = useState("all");
  const filteredTemplates =
    verticalFilter === "all"
      ? VERTICAL_TEMPLATE_CATALOG
      : VERTICAL_TEMPLATE_CATALOG.filter((template) => template.tag === verticalFilter);
  return (
    <div className="   text-secondary-dark justify-center items-center">
      <Container>
        <section className="flex flex-col items-end justify-center gap-4 leading-[1.3] text-secondary-dark ">
          <h1 className="text-[clamp(1.62rem,4.6vw,4.5rem)] font-medium">
            Choose the best Responsive Website Theme for your business
          </h1>

          <GetStartedButton handleSubmit={() => navigate("/signup")} />
        </section>
      </Container>

      {/*Top Recommendations */}
      <section className="w-full bg-gray-100 lg:flex lg:flex-col justify-center items-center gap-8">
        <Container>
          <div className="space-y-12">
            <div>
              <h1 className="text-[clamp(2rem,2.5vw,5rem)] font-medium pb-2">
                Top Theme Recommendations
              </h1>
              <span className="text-[clamp(1rem,1.8vw,3rem)]">
                Cherry pick features or ask us to customize anything for your
                business growth. Fully tech ready, integrated and responsive.
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {VERTICAL_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setVerticalFilter(filter.value)}
                  className={`rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${
                    verticalFilter === filter.value
                      ? "border-black bg-black text-white"
                      : "border-black/20 text-secondary-dark hover:border-black/60"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="flex overflow-x-auto gap-6 snap-x snap-mandatory scrollbar-hide lg:grid lg:grid-cols-2 lg:gap-10 lg:overflow-visible">
              {filteredTemplates.map((template) => (
                <div
                  data-aos="fade-up"
                  className="flex-shrink-0 w-[85vw] md:w-[45vw] h-full overflow-hidden rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.5)] snap-start lg:w-full cursor-pointer"
                  onClick={() => {
                    navigate("products", { state: { template } });
                    window.scrollTo({ top: 0, behavior: "instant" });
                  }}
                  key={template.id}
                >
                  <img
                    className="rounded-xl w-full h-full object-cover transition-transform duration-500 ease hover:scale-[1.2] cursor-pointer origin-center"
                    src={template.heroImage}
                    alt={`${template.name} theme`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-center items-center">
              <GetStartedButton handleSubmit={() => navigate("/signup")} />
            </div>
          </div>
        </Container>
      </section>

      {/*Customize */}
      <section>
        <Container>
          <div className="flex lg:flex-nowrap flex-wrap justify-between items-center gap-8">
            <div className="flex flex-col gap-6 sm:gap-16 w-full lg:w-[50%]">
              <div className="text-[clamp(2rem,4.2vw,6rem)] md:text-[clamp(2rem,8vw,8rem)] lg:text-[clamp(2rem,4.2vw,6rem)] leading-none">
                <h1 className="font-normal">
                  Customize it <br className="hidden lg:block" /> your way
                </h1>
              </div>
              <ul className="flex flex-col gap-2">
                <li>1000's advanced web capabilities</li>
                <li>Intuitive drag and drop website editor</li>
                <li>Powerful AI features for smart customization</li>
                <li>Full-stack web dev tools for custom functionality</li>
              </ul>
              <div className="flex justify-center md:justify-start w-full">
                <GetStartedButton handleSubmit={() => navigate("/signup")} />
              </div>
            </div>
            <div className="w-full lg:w-[50%] h-full">
              <img
                src="/hosts/themes/biznestMockUp.png"
                alt="Biznest MockUp"
                className="w-full h-full"
              />
            </div>
          </div>
        </Container>
      </section>
      <MySeperator />
      {/*Website Builder */}
      <Container>
        <div className="flex flex-col justify-between items-center gap-6 sm:gap-14">
          <div className="text-[clamp(2rem,4.3vw,4.5rem)] md:text-[clamp(2rem,7vw,8rem)] lg:text-[clamp(2rem,4.3vw,4.5rem)] w-full lg:w-[70%] self-start leading-[1.2]">
            <h1 className="font-normal">
              A website builder engineered for growth
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 gap-x-20">
            {themeWebsiteGridData.map((item, index) => (
              <div key={index} className="flex flex-col gap-4 lg:gap-6">
                <h4 className="text-[1.3rem] lg:text-[1.3rem] font-medium">
                  {item.title}
                </h4>
                <p className="text-content">{item.description}</p>
              </div>
            ))}
          </div>
          <div>
            <GetStartedButton handleSubmit={() => navigate("/signup")} />
          </div>
        </div>
      </Container>

      <MySeperator />

      {/*We're here*/}
      <Container>
        <section className="flex flex-col justify-between items-center  gap-10 mb-10">
          <div className="text-[clamp(2rem,4vw,5rem)] md:text-[clamp(2rem,6.8vw,7rem)] lg:text-[clamp(2rem,4vw,5rem)] w-full lg:w-[70%] self-start leading-[1.2]">
            <h1 className="font-normal">We're here for you</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {supportItems.map((item, index) => (
              <div
                className="flex flex-col gap-8 border-t-2 border-black pt-10"
                key={index}
              >
                <h2 className="font-medium text-content">{item.title}</h2>
                <p>{item.description}</p>
                <span
                  className="cursor-pointer font-semibold underline hover:no-underline underline-offset-8 transition-hover duration-500 ease max-w-fit"
                  onClick={() => {
                    navigate(item.path);
                    window.scrollTo({ top: 0, behavior: "instant" });
                  }}
                >
                  {item.linkText}
                </span>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
};

export default Themes;
