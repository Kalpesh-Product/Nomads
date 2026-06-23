import React from "react";
import { useOutletContext } from "react-router-dom";
import Container from "../../components/Container";
import { getMediaUrl } from "./utils/pageTemplateUtils";

const TemplateAboutPage = () => {
  const { data, isPending, error } = useOutletContext();

  if (isPending) return null;
  if (error) return <div>Error loading about page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  const teamCards = Array.isArray(data?.aboutPageImageCards)
    ? data.aboutPageImageCards
    : [];
  const aboutParagraphs = Array.isArray(data?.about) ? data.about : [];

  return (
    <section className="bg-[#efefef]">
      <div className="bg-black py-12 text-white">
        <Container>
          <div className="flex flex-col gap-10">
            <div className="mx-auto max-w-5xl text-center">
              <h1 className="text-center text-title font-semibold text-[#f4e01a]">
                {data?.aboutPageIntro || "About Our Vision"}
              </h1>
              <div className="mx-auto mt-6 space-y-4 text-subtitle">
                {aboutParagraphs.length > 0 ? (
                  aboutParagraphs.map((para, index) => (
                    <p key={`${String(para).slice(0, 24)}-${index}`} className="text-white">
                      {para}
                    </p>
                  ))
                ) : (
                  <p className="text-white">
                    BIZ Nest is built around a destination-based lifestyle model.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-sm">
                <h2 className="mb-3 text-2xl font-semibold text-[#f4e01a]">
                  {data?.aboutPageStoryHeading || "Our Story"}
                </h2>
                <p className="leading-7">
                  {data?.aboutPageStory ||
                    "Our vision is to become a global destination-based lifestyle subscription platform."}
                </p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-sm">
                <h2 className="mb-3 text-2xl font-semibold text-[#f4e01a]">
                  {data?.aboutPageMissionHeading || "Our Mission"}
                </h2>
                <p className="leading-7">
                  {data?.aboutPageMission ||
                    "We believe the future is about truly living, not just breathing, while working and staying in meaningful destinations."}
                </p>
              </article>
            </div>

            {teamCards.length > 0 ? (
              <div className="pt-2">
                <h2 className="mb-6 text-center text-2xl font-semibold text-[#f4e01a]">
                  {data?.aboutPageTeamHeading || "Our Team"}
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {teamCards.map((item, index) => {
                    const mediaUrl = getMediaUrl(item?.image);

                    return (
                      <article
                        key={`${item?.title || "team"}-${index}`}
                        className="overflow-hidden rounded-2xl bg-[#111] text-white shadow-sm"
                      >
                        <div className="aspect-[4/3] bg-slate-200">
                          {mediaUrl ? (
                            <img
                              src={mediaUrl}
                              alt={item?.title || "team-member"}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold">{item?.title || "Team Member"}</h3>
                          <p className="mt-1 text-sm text-white/80">
                            {item?.description || ""}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </Container>
      </div>
    </section>
  );
};

export default TemplateAboutPage;
