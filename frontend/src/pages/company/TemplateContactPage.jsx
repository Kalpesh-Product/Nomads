import React from "react";
import { BsEnvelope } from "react-icons/bs";
import { MdOutlinePhone } from "react-icons/md";
import { CiMap } from "react-icons/ci";
import { useOutletContext } from "react-router-dom";
import Container from "../../components/Container";
import LinedHeading from "./components/LinedHeading";
import { getMediaSrc } from "./utils/templateRouteUtils";

const TemplateContactPage = () => {
  const { data, isPending, error } = useOutletContext();
  if (isPending) return null;
  if (error) return <div>Error loading contact page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  return (
    <section className="min-h-[60vh] bg-[#efefef] py-0">
      <Container>
        <div className="flex flex-col gap-6">
          <LinedHeading title={data?.contactPageHeading || data?.contactTitle || "Contact"} />
          {data?.contactPageIntro ? (
            <p className="text-center text-gray-600">{data.contactPageIntro}</p>
          ) : null}
          <div className="flex flex-wrap items-stretch gap-4 md:flex-nowrap">
            <iframe
              title="Office Map"
              className="h-[25rem] w-full"
              loading="lazy"
              src={data?.mapUrl}
            ></iframe>
            <div className="w-full bg-white p-4 shadow-md lg:w-[40%]">
              <div className="flex h-full flex-col gap-4">
                <div className="h-16 w-full overflow-hidden">
                  <img
                    src={getMediaSrc(data?.companyLogo)}
                    alt="company-logo"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex h-full flex-col items-center justify-center gap-4">
                  <div className="flex w-full items-center gap-4">
                    <div className="rounded-full border-2 border-accent p-2 text-subtitle">
                      <BsEnvelope />
                    </div>
                    <div className="pl-2 text-small">
                      <span>{data?.contactPersonEmail || data?.websiteEmail || data?.email}</span>
                    </div>
                  </div>
                  <div className="flex w-full items-center gap-4">
                    <div className="rounded-full border-2 border-accent p-2 text-subtitle">
                      <MdOutlinePhone />
                    </div>
                    <div className="pl-2 text-small">
                      <span>{data?.contactPersonPhone || data?.phone}</span>
                    </div>
                  </div>
                  <div className="flex w-full items-center gap-4">
                    <div className="rounded-full p-2 text-subtitle">
                      <CiMap />
                    </div>
                    <div className="pl-2 text-small">
                      <span>{data?.address}</span>
                    </div>
                  </div>
                  {data?.contactBusinessHours ? (
                    <p className="text-small text-center text-gray-600">
                      {data.contactBusinessHours}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default TemplateContactPage;
