import React from "react";
import { useTemplateData } from "./templates/useTemplateData";
import {
  BROWN,
  CONTACT_ICON_CIRCLE,
  ContactMailIcon,
  ContactMapIcon,
  ContactPhoneIcon,
  CREAM,
  FONT_IMPORT,
  LinedHeading,
  MUTED,
  PAGE_WRAP,
  SANS,
} from "./templates/warmOrganic/WarmOrganicShared";

const WarmOrganicTemplateContactPage = () => {
  const t = useTemplateData();
  const { data } = t;

  if (t.isPending) return null;
  if (t.error) return <div>Error loading contact page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  return (
    <div className={`wo-template min-h-screen ${SANS}`} style={{ backgroundColor: "#F1E6D3", color: BROWN }}>
      <style>{FONT_IMPORT}</style>
      <section className={PAGE_WRAP}>
        <LinedHeading title={data?.contactPageHeading || data?.contactTitle || "Contact"} className="justify-center" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[0.6fr_0.4fr]">
          {data?.mapUrl ? (
            <iframe title="map" src={data.mapUrl} className="h-[300px] w-full rounded-3xl border-0 md:h-[420px]" loading="lazy" />
          ) : (
            <div className="h-[300px] w-full rounded-3xl md:h-[420px]" style={{ backgroundColor: `${BROWN}0D` }} />
          )}
          <div className="flex flex-col gap-5 rounded-3xl p-7 text-[15px]" style={{ backgroundColor: CREAM, color: MUTED }}>
            {data?.companyLogoUrl ? (
              <img src={data.companyLogoUrl} alt={data.companyName || "Company"} className="mb-3 h-16 w-auto object-contain md:h-20" />
            ) : null}
            {t.contactEmail ? (
              <a href={`mailto:${t.contactEmail}`} className="flex items-center gap-4 transition hover:opacity-70" style={{ color: BROWN }}>
                <CONTACT_ICON_CIRCLE>
                  <ContactMailIcon />
                </CONTACT_ICON_CIRCLE>
                <span className="min-w-0 break-words">{t.contactEmail}</span>
              </a>
            ) : null}
            {t.contactPhone ? (
              <a
                href={`tel:${t.contactPhone.replace(/[^\d+]/g, "")}`}
                className="flex items-center gap-4 transition hover:opacity-70"
                style={{ color: BROWN }}
              >
                <CONTACT_ICON_CIRCLE>
                  <ContactPhoneIcon />
                </CONTACT_ICON_CIRCLE>
                <span className="min-w-0 break-words">{t.contactPhone}</span>
              </a>
            ) : null}
            {t.contactAddress ? (
              <div className="flex items-start gap-4">
                <CONTACT_ICON_CIRCLE>
                  <ContactMapIcon />
                </CONTACT_ICON_CIRCLE>
                <span className="min-w-0 break-words pt-0.5">{t.contactAddress}</span>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
};

export default WarmOrganicTemplateContactPage;
