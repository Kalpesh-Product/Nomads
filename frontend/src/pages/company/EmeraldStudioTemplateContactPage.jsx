import React from "react";
import { useTemplateData } from "./templates/useTemplateData";
import {
  BODY_FONT,
  CONTACT_ICON_CIRCLE,
  ContactMailIcon,
  ContactMapIcon,
  ContactPhoneIcon,
  FONT_IMPORT,
  HEADING_FONT,
  LinedHeading,
  SECTION_BG,
  STYLE_OVERRIDES,
  TEMPLATE_ROOT_CLASS,
} from "./templates/emeraldStudio/EmeraldStudioShared";

const EmeraldStudioTemplateContactPage = () => {
  const t = useTemplateData();
  const { data } = t;

  if (t.isPending) return null;
  if (t.error) return <div>Error loading contact page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  return (
    <div className={`${TEMPLATE_ROOT_CLASS} min-h-screen bg-[#002c22] text-stone-100 ${BODY_FONT}`}>
      <style>{`${FONT_IMPORT}${STYLE_OVERRIDES}`}</style>
      <section className={`pt-20 pb-24 px-6 ${SECTION_BG}`}>
        <div className="max-w-7xl mx-auto text-center mb-12">
          <LinedHeading title={data?.contactPageHeading || data?.contactTitle || "Contact"} className="justify-center" />
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 gap-8 md:grid-cols-[0.6fr_0.4fr]">
          {data?.mapUrl ? (
            <iframe title="map" src={data.mapUrl} loading="lazy" className="h-[320px] w-full rounded-2xl border-0 md:h-[440px]" />
          ) : (
            <div className="h-[320px] w-full rounded-2xl border border-emerald-800/50 bg-emerald-900/40 md:h-[440px]" />
          )}
          <div className="flex flex-col gap-6 rounded-2xl border border-emerald-800/50 bg-emerald-900/40 p-8">
            {data?.companyLogoUrl ? (
              <img src={data.companyLogoUrl} alt={data.companyName || "Company"} className="mb-7 h-12 w-auto self-center object-contain" />
            ) : (
              <span className={`mb-1 flex h-12 w-12 items-center justify-center self-start rounded-lg bg-amber-400 text-lg font-bold text-emerald-950 ${HEADING_FONT}`}>
                {(data?.companyName || "Y").charAt(0).toUpperCase()}
              </span>
            )}
            {t.contactEmail ? (
              <a href={`mailto:${t.contactEmail}`} className="flex items-center gap-4 text-stone-300 hover:text-amber-400">
                <CONTACT_ICON_CIRCLE>
                  <ContactMailIcon />
                </CONTACT_ICON_CIRCLE>
                <span>{t.contactEmail}</span>
              </a>
            ) : null}
            {t.contactPhone ? (
              <a href={`tel:${t.contactPhone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-4 text-stone-300 hover:text-amber-400">
                <CONTACT_ICON_CIRCLE>
                  <ContactPhoneIcon />
                </CONTACT_ICON_CIRCLE>
                <span>{t.contactPhone}</span>
              </a>
            ) : null}
            {t.contactAddress ? (
              <div className="flex items-start gap-4 text-stone-300">
                <CONTACT_ICON_CIRCLE>
                  <ContactMapIcon />
                </CONTACT_ICON_CIRCLE>
                <span className="whitespace-pre-line">{t.contactAddress}</span>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
};

export default EmeraldStudioTemplateContactPage;
