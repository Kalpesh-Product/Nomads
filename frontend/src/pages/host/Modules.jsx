import Container from "../../components/Container";
import FitText from "../../components/FitText";
import GetStartedButton from "../../components/GetStartedButton";
import FinanceImage from "../../assets/images-service/finance-final.png";
import useIsMobile from "../../hooks/useIsMobile.js";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { hostModuleCategories } from "../../data/hostModulesCatalog";
import ModuleCategoryBlock from "./modules/ModuleCategoryBlock";

// MOCK IMPLEMENTATION for manager review: module data in
// data/hostModulesCatalog.js is placeholder content, sourced from the dev
// team's Basic-plan doc. Navigation into a module stays with the site's own
// sidebar — this page just lists every category as its own section, in
// order: Common Modules, Extra Common Modules, Key Apps, Core Modules.
// Clicking a sidebar item (?category=&module=) jumps straight to and
// pre-selects that section. Once signed off, this moves to the master
// (editable) config.
export default function Modules() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const targetCategoryId = searchParams.get("category");
  const targetModuleId = searchParams.get("module");

  useEffect(() => {
    const anchorId = targetModuleId || targetCategoryId;
    if (!anchorId) return;
    const section = document.getElementById(anchorId);
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [targetCategoryId, targetModuleId]);

  return (
    <Container>
      <div className="flex flex-col gap-8 w-full">
        <div className="flex flex-col gap-8">
          <FitText
            as="h1"
            text="The ONLY Nomad Ecosystem SaaS Platform!"
            className="font-semibold font-comic"
            minFontSize={18}
            maxFontSize={56}
          />
          <div>
            <h4 className="text-lg lg:text-[1.8rem] lg:leading-[2.75rem] text-start md:text-center lg:text-start ">
              No Code Website <span className="text-primary-blue"></span>
              <span className="text-primary-blue">+</span> Booking Engine{" "}
              <span className="text-primary-blue">+</span> Payment Gateway{" "}
              <span className="text-primary-blue">+</span> Accounting{" "}
              <span className="text-primary-blue">+</span> Reports{" "}
              <span className="text-primary-blue">+</span> Analytics{" "}
              <span className="text-primary-blue">+</span> HR Support{" "}
              <span className="text-primary-blue">+</span> Customer & Client
              Management <span className="text-primary-blue">+</span> Marketing
              and more.
            </h4>
          </div>
          <div className="flex justify-center items-center sm:justify-end">
            <GetStartedButton
              title="Get Started"
              handleSubmit={() => navigate("/signup")}
            />
          </div>
        </div>

        <hr className="border-t-4" />
      </div>
      <div className=" flex flex-col gap-4 py-0 lg:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
          <div className=" flex flex-col gap-2">
            <div className="flex flex-col relative text-card-title md:text-3xl font-medium my-3 w-full">
              Real-time operations
              <img
                src="/blue-line.png"
                alt="greenUnderLine"
                className="w-3/4 md:w-1/4 h-6"
              />
            </div>
            {isMobile && (
              <div className="SaaS-featured-grid-right h-[30vh] md:h-[35vh] lg:h-[50vh] overflow-hidden border-gray-100 border-[1px] p-2 rounded-lg">
                <img
                  className="h-full w-full object-cover"
                  src={FinanceImage}
                  alt="ServiceGridImage"
                />
              </div>
            )}
            <span className="text-lx md:text-xl lg:text:2xl">
              Manage your business in real-time across all business verticals.
            </span>
            <span className="text-lx md:text-xl lg:text:2xl">
              Operate your business in real-time with the micro most details of
              inventory, bookings, accounts, analytics, leads, sales, reports,
              tasks, logs, menu, complaints, requests etc.
            </span>
          </div>
          {!isMobile && (
            <div className="SaaS-featured-grid-right h-[30vh] md:h-[35vh] lg:h-[50vh] overflow-hidden border-gray-100 border-[1px] p-2 rounded-lg">
              <img
                className="h-full w-full object-cover"
                src={FinanceImage}
                alt="ServiceGridImage"
              />
            </div>
          )}
        </div>
        <hr
          className="h-[1px] text-gray-500 bg-gray-500 mb-2
         lg:mt-10"
        />
      </div>

      <Container padding={false}>
        <div data-aos="fade-up" className="flex flex-col gap-10 lg:gap-14">
          {hostModuleCategories.map((category) => (
            <div
              key={category.id}
              id={category.id}
              className="flex flex-col gap-10 scroll-mt-24"
            >
              <ModuleCategoryBlock
                category={category}
                sortByPlan={category.id !== "department-accesses"}
              />
              <hr className="border-t-4" />
            </div>
          ))}
        </div>
      </Container>

      <hr />
      <div className="flex justify-center w-full my-16">
        <GetStartedButton
          title={"Get Started"}
          handleSubmit={() => navigate("/signup")}
        />
      </div>
      <hr />
    </Container>
  );
}
