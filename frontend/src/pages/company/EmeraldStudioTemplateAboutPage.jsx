import React from "react";
import { useTemplateData } from "./templates/useTemplateData";
import {
  BODY_FONT,
  FONT_IMPORT,
  HEADING_FONT,
  LinedHeading,
  SECTION_BG,
  STYLE_OVERRIDES,
  TEMPLATE_ROOT_CLASS,
} from "./templates/emeraldStudio/EmeraldStudioShared";
import { getMediaSrc } from "./utils/templateRouteUtils";

const getNonEmptyTextList = (...values) => values.map((v) => String(v || "").trim()).filter(Boolean);

const EmeraldStudioTemplateAboutPage = () => {
  const t = useTemplateData();
  const { data } = t;

  if (t.isPending) return null;
  if (t.error) return <div>Error loading about page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  const aboutBlocks = Array.isArray(data?.about) ? data.about : [];
  const aboutIntroBlocks = getNonEmptyTextList(
    data?.aboutPageIntro,
    data?.aboutPageOverview,
    ...aboutBlocks.map((block) => (typeof block === "string" ? block : block?.text)),
  );
  const aboutNarrativeBlocks = [
    { title: data?.aboutPageStoryHeading || "Our Story", body: String(data?.aboutPageStory || "").trim() },
    { title: data?.aboutPageMissionHeading || "Our Mission", body: String(data?.aboutPageMission || "").trim() },
    { title: data?.aboutPageVisionHeading || "Our Vision", body: String(data?.aboutPageVision || "").trim() },
    { title: data?.aboutPageValuesHeading || "Our Values", body: String(data?.aboutPageValues || "").trim() },
  ].filter((item) => item.body);
  const aboutPageImageCards = Array.isArray(data?.aboutPageImageCards)
    ? data.aboutPageImageCards.filter((card) => String(card?.title || "").trim() || String(card?.description || "").trim() || card?.image)
    : [];
  const founders = Array.isArray(data?.founders) ? data.founders.filter((f) => String(f?.name || "").trim()) : [];

  return (
    <div className={`${TEMPLATE_ROOT_CLASS} min-h-screen bg-[#002c22] text-stone-100 ${BODY_FONT}`}>
      <style>{`${FONT_IMPORT}${STYLE_OVERRIDES}`}</style>

      <section className={`pt-20 pb-20 px-6 ${SECTION_BG}`}>
        <div className="max-w-7xl mx-auto text-center">
          <LinedHeading title={String(data?.aboutTitle || "").trim() || "About Our Vision"} className="justify-center" />
          {aboutIntroBlocks.length > 0 ? (
            <p className="text-stone-400 text-lg max-w-2xl mx-auto leading-relaxed">{aboutIntroBlocks[0]}</p>
          ) : null}
        </div>

        {aboutNarrativeBlocks.length ? (
          <div className="mt-14 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {aboutNarrativeBlocks.map((item, i) => (
              <div key={item.title} className="flex gap-5 bg-emerald-900/40 border border-emerald-800/50 rounded-xl p-7">
                <span className={`text-amber-400 font-bold text-xl shrink-0 ${HEADING_FONT}`}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className={`font-semibold text-lg mb-2 text-stone-100 ${HEADING_FONT}`}>{item.title}</h3>
                  <p className="text-stone-400 text-sm leading-relaxed whitespace-pre-line">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {founders.length ? (
        <section className={`py-24 px-6 ${SECTION_BG}`}>
          <div className="max-w-7xl mx-auto">
            <LinedHeading title="Our Founders" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {founders.map((founder, idx) => {
                const founderImg = getMediaSrc(founder?.image);
                return (
                  <div key={idx} className="group">
                    <div className="rounded-xl overflow-hidden h-64 bg-emerald-900 mb-4">
                      {founderImg ? (
                        <img
                          src={founderImg}
                          alt={founder?.name || ""}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        />
                      ) : null}
                    </div>
                    <p className={`font-semibold text-stone-100 ${HEADING_FONT}`}>{founder?.name}</p>
                    <p className="text-stone-500 text-sm">{founder?.role}</p>
                    {founder?.bio ? <p className="text-stone-400 text-xs mt-1 leading-relaxed">{founder.bio}</p> : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {aboutPageImageCards.length > 0 ? (
        <section className={`py-24 px-6 ${SECTION_BG}`}>
          <div className="max-w-7xl mx-auto">
            <LinedHeading title={data?.aboutPageTeamHeading || "Our Team"} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {aboutPageImageCards.map((card, idx) => {
                const image = getMediaSrc(card?.image);
                return (
                  <div key={idx}>
                    {image ? (
                      <img src={image} alt={card?.title || ""} className="aspect-[4/3] w-full object-cover rounded-xl" />
                    ) : (
                      <div className="aspect-[4/3] w-full bg-emerald-900/40 rounded-xl" />
                    )}
                    {card?.title ? <p className={`mt-3 font-semibold text-stone-100 ${HEADING_FONT}`}>{card.title}</p> : null}
                    {card?.description ? <p className="mt-1 text-stone-400 text-sm">{card.description}</p> : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default EmeraldStudioTemplateAboutPage;
