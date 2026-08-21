import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useTemplateData } from "./templates/useTemplateData";
import {
  BROWN,
  CREAM,
  EYEBROW,
  FaqList,
  FONT_IMPORT,
  FOREST,
  Inclusions,
  INPUT,
  LinedHeading,
  MUTED,
  PAGE_WRAP,
  ProductGrid,
  RUST,
  SANS,
  SERIF,
  inputStyle,
} from "./templates/warmOrganic/WarmOrganicShared";
import { api } from "../../utils/axios";
import { getCatalogItemsForProductPage, getPageHeroImages } from "./utils/pageTemplateUtils";
import { getMediaSrc, normalizeSlug } from "./utils/templateRouteUtils";

const isMenuProductSlug = (slug) => {
  const normalized = normalizeSlug(slug, "");
  return normalized.includes("cafe") || normalized.includes("menu");
};

// Same vertical-conditional lead field sets HostPanel's useWebsiteTemplateData
// hook (getLeadFieldsForProduct) and Fresh Studio's Nomads port already use —
// duplicated locally here because Nomads' thin useTemplateData hook has no
// cross-section UI state, only read-only data + navigation.
const getLeadFields = (pageSlug) => {
  const normalized = normalizeSlug(pageSlug, "");
  if (normalized.includes("meeting")) {
    return [
      { key: "fullName", label: "Full Name", type: "text", required: true },
      { key: "mobile", label: "Mobile Number", type: "tel", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "people", label: "No. Of Attendees", type: "number", required: true },
      { key: "startDate", label: "Meeting Date", type: "date", required: true },
      { key: "endDate", label: "Meeting End Date", type: "date", required: false },
    ];
  }
  if (normalized.includes("workation")) {
    return [
      { key: "fullName", label: "Full Name", type: "text", required: true },
      { key: "mobile", label: "Mobile Number", type: "tel", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "people", label: "No. Of Guests", type: "number", required: true },
      { key: "startDate", label: "Check-In Date", type: "date", required: true },
      { key: "endDate", label: "Check-Out Date", type: "date", required: true },
    ];
  }
  if (normalized.includes("co-living") || normalized.includes("coliving")) {
    return [
      { key: "fullName", label: "Full Name", type: "text", required: true },
      { key: "mobile", label: "Mobile Number", type: "tel", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "people", label: "No. Of Occupants", type: "number", required: true },
      { key: "startDate", label: "Move-In Date", type: "date", required: true },
      { key: "endDate", label: "Preferred Stay Until", type: "date", required: false },
    ];
  }
  if (normalized.includes("hostel")) {
    return [
      { key: "fullName", label: "Full Name", type: "text", required: true },
      { key: "mobile", label: "Mobile Number", type: "tel", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "people", label: "Beds Required", type: "number", required: true },
      { key: "startDate", label: "Check-In Date", type: "date", required: true },
      { key: "endDate", label: "Check-Out Date", type: "date", required: true },
    ];
  }
  return [
    { key: "fullName", label: "Full Name", type: "text", required: true },
    { key: "mobile", label: "Mobile Number", type: "tel", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "people", label: "No. Of People", type: "number", required: false },
    { key: "startDate", label: "Start Date", type: "date", required: false },
    { key: "endDate", label: "End Date", type: "date", required: false },
  ];
};

const WarmOrganicTemplateServiceDetailPage = () => {
  const { slug, itemSlug } = useParams();
  const t = useTemplateData();
  const { data, rawProductDropdownPages } = t;
  const [productHeroIndex, setProductHeroIndex] = useState(0);
  const [leadForm, setLeadForm] = useState({ fullName: "", people: "", mobile: "", email: "", startDate: "", endDate: "" });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadSubmitPending, setLeadSubmitPending] = useState(false);
  const [leadSubmitError, setLeadSubmitError] = useState("");

  if (t.isPending) return null;
  if (t.error) return <div>Error loading product page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  const page =
    t.productPages.find((item) => item.slug === slug) ||
    t.productPages.find((item) => normalizeSlug(item?.slug || item?.name || "", "") === slug);

  if (!page) {
    return (
      <div className={`wo-template min-h-screen ${SANS}`} style={{ backgroundColor: "#F1E6D3", color: BROWN }}>
        <style>{FONT_IMPORT}</style>
        <section className={PAGE_WRAP}>
          <div className="text-center">
            <h1 className={`text-[20px] font-normal ${SERIF}`}>Service Page Not Found</h1>
            <p className="mt-2 text-[14px]" style={{ color: MUTED }}>
              This page is not configured for this website.
            </p>
            <button
              type="button"
              onClick={() => t.goToSection("products")}
              className="mt-6 rounded-full px-7 py-3 text-[13px] font-semibold"
              style={{ backgroundColor: FOREST, color: CREAM }}
            >
              Back to Services
            </button>
          </div>
        </section>
      </div>
    );
  }

  // Raw (un-normalized) productDropdownPages so inclusions never get lost to
  // normalization — same defensive lookup Fresh Studio's Nomads port uses.
  const pageInclusions = (() => {
    const sources = [rawProductDropdownPages, data?.productDropdownPages];
    for (const source of sources) {
      if (!Array.isArray(source)) continue;
      const match = source.find((p) => normalizeSlug(p?.slug || p?.name || "", "") === slug);
      if (Array.isArray(match?.inclusions) && match.inclusions.length > 0) return match.inclusions;
    }
    return [];
  })();

  const heroImages = getPageHeroImages(page);
  const selectedProductHeroImages = heroImages;
  const selectedProductHeroImage = selectedProductHeroImages[productHeroIndex] || heroImages[0] || "";
  const productCatalog = getCatalogItemsForProductPage(data, page);
  const productPageName = String(page?.name || page?.heading || "").trim();
  const leadFormFields = getLeadFields(page?.slug || page?.name || "");

  const selectedDetailItem = itemSlug
    ? productCatalog.find((item) => normalizeSlug(item?.name || item?.title || "", "") === itemSlug)
    : null;

  const submitLeadForm = async (event) => {
    event.preventDefault();
    setLeadSubmitPending(true);
    setLeadSubmitError("");
    try {
      await api.post("/leads/create-lead", {
        fullName: leadForm.fullName,
        name: leadForm.fullName,
        mobileNumber: leadForm.mobile,
        mobile: leadForm.mobile,
        phone: leadForm.mobile,
        email: leadForm.email,
        noOfPeople: leadForm.people || 1,
        people: leadForm.people || 1,
        attendees: leadForm.people || 1,
        startDate: leadForm.startDate || undefined,
        endDate: leadForm.endDate || undefined,
        source: "website",
        inquiryType: productPageName || "Product Enquiry",
        productType: productPageName || "",
        packageName: selectedDetailItem?.name || selectedDetailItem?.title || "",
        companyName: data?.companyName || "",
        companyId: data?.companyId || "",
        workspaceId: data?.workspaceId || "",
        searchKey: data?.searchKey || "",
        vertical: data?.vertical || "",
        websiteUrl: window.location.href,
      });
      setLeadSubmitted(true);
    } catch (error) {
      console.error("Failed to submit lead:", error);
      setLeadSubmitError(error?.response?.data?.message || "Failed to submit enquiry. Please try again.");
    } finally {
      setLeadSubmitPending(false);
    }
  };

  return (
    <div className={`wo-template min-h-screen ${SANS}`} style={{ backgroundColor: "#F1E6D3", color: BROWN }}>
      <style>{FONT_IMPORT}</style>
      {selectedDetailItem ? (
        <>
          <section className={PAGE_WRAP}>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start md:gap-10">
              <div className="w-full">
                {getMediaSrc(selectedDetailItem?.images) || getMediaSrc(selectedDetailItem?.cardImage) ? (
                  <img
                    src={getMediaSrc(selectedDetailItem?.images) || getMediaSrc(selectedDetailItem?.cardImage)}
                    alt={selectedDetailItem?.name || selectedDetailItem?.title || "Service"}
                    className="h-[300px] w-full rounded-3xl object-cover md:h-[480px]"
                  />
                ) : (
                  <div className="h-[300px] w-full rounded-3xl md:h-[480px]" style={{ backgroundColor: `${BROWN}0D` }} />
                )}
              </div>
              <div className="flex flex-col md:h-[480px]">
                <div className="shrink-0">
                  <h1 className={`text-[28px] md:text-[34px] font-normal ${SERIF}`}>
                    {selectedDetailItem?.name || selectedDetailItem?.title || "Service"}
                  </h1>
                  {selectedDetailItem?.price || selectedDetailItem?.cost ? (
                    <p className="mt-1 text-[14px]" style={{ color: MUTED }}>
                      {selectedDetailItem?.price || selectedDetailItem?.cost}
                    </p>
                  ) : null}
                </div>
                <div className="flex-1 overflow-y-auto py-2 pr-1">
                  {selectedDetailItem?.description ? (
                    <ul className="space-y-2">
                      {selectedDetailItem.description
                        .split(/\n|(?<=\.)\s+/)
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((point, i) => (
                          <li key={`desc-bullet-${i}`} className="flex items-start gap-2 text-[14px] leading-relaxed" style={{ color: MUTED }}>
                            <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: RUST }} />
                            <span>{point}</span>
                          </li>
                        ))}
                    </ul>
                  ) : null}
                </div>
                <div className="shrink-0">
                  {leadSubmitted ? (
                    <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: CREAM }}>
                      <p className="text-[14px] font-medium">Enquiry submitted successfully.</p>
                      <p className="mt-1 text-[13px]" style={{ color: MUTED }}>
                        We'll get back to you shortly.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={submitLeadForm} className="flex flex-col gap-3">
                      <span className={`${EYEBROW} block text-center`} style={{ color: RUST }}>
                        Enquire now
                      </span>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {leadFormFields.map((field) => (
                          <input
                            key={field.key}
                            type={field.type === "date" ? "date" : field.type}
                            required={field.required}
                            placeholder={field.label}
                            value={leadForm[field.key] ?? ""}
                            onChange={(e) => setLeadForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                            className={INPUT}
                            style={inputStyle}
                          />
                        ))}
                      </div>
                      {leadSubmitError ? <p className="text-[12px] text-red-600">{leadSubmitError}</p> : null}
                      <button
                        type="submit"
                        disabled={leadSubmitPending}
                        className="rounded-full py-3 text-[13px] font-semibold disabled:opacity-50"
                        style={{ backgroundColor: FOREST, color: CREAM }}
                      >
                        {leadSubmitPending ? "Submitting…" : "Submit enquiry"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </section>
          {pageInclusions.length > 0 ? <Inclusions inclusions={pageInclusions} title={`${productPageName} Inclusions`} /> : null}
          <FaqList faqs={Array.isArray(data?.faqs) ? data.faqs : []} />
        </>
      ) : (
        <>
          <section className="relative h-[50svh] min-h-[320px] overflow-hidden md:h-[85vh] md:min-h-[400px]" style={{ backgroundColor: `${BROWN}0D` }}>
            {selectedProductHeroImage ? (
              <img src={selectedProductHeroImage} alt={page?.name || "Service"} className="absolute inset-0 h-full w-full object-cover opacity-100" />
            ) : null}
            <div className="absolute inset-0 flex flex-col items-center justify-end gap-2 px-6 pb-10 text-center md:pb-14">
              <h1 className={`text-[28px] font-normal ${SERIF} md:text-[38px]`} style={{ color: "white" }}>
                {page?.heroHeading || page?.name}
              </h1>
              {page?.heroSubHeading ? (
                <p className="mx-auto mt-1 max-w-xl text-[14.5px]" style={{ color: MUTED }}>
                  {page.heroSubHeading}
                </p>
              ) : null}
              {page?.heroButtonText ? (
                <button
                  type="button"
                  className="mt-2 self-center rounded-full px-7 py-3 text-[13px] font-semibold transition duration-200 hover:opacity-90"
                  style={{ backgroundColor: FOREST, color: CREAM }}
                >
                  {page.heroButtonText}
                </button>
              ) : null}
            </div>
            {page?.heroMode === "carousel" && selectedProductHeroImages.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => setProductHeroIndex((prev) => (prev - 1 + selectedProductHeroImages.length) % selectedProductHeroImages.length)}
                  className="absolute left-5 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/50 px-4 py-2 text-2xl text-white md:block"
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setProductHeroIndex((prev) => (prev + 1) % selectedProductHeroImages.length)}
                  className="absolute right-5 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/50 px-4 py-2 text-2xl text-white md:block"
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            ) : null}
          </section>

          <section className={PAGE_WRAP}>
            <LinedHeading
              title={`${productPageName || "Our"} ${isMenuProductSlug(page?.slug || "") ? "Menu" : "Services"}`}
              className="justify-center"
            />
            <div className="mt-8">
              {isMenuProductSlug(page?.slug || "") ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {(Array.isArray(data?.menuItems) ? data.menuItems : []).map((item, idx) => (
                    <div key={idx} className="rounded-2xl p-5" style={{ backgroundColor: CREAM }}>
                      {item?.image ? <img src={item.image} alt={item?.name} className="aspect-[4/3] w-full rounded-xl object-cover" /> : null}
                      <div className="mt-3 flex items-center justify-between">
                        <h4 className={`text-[15px] font-normal ${SERIF}`}>{item?.name}</h4>
                        {item?.price ? (
                          <span className="text-[13px]" style={{ color: MUTED }}>
                            {item.price}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ProductGrid
                  products={productCatalog.length ? productCatalog : [page]}
                  onSelect={(item) => t.goToProductItem(page?.slug || page?.name || "", item?.title || item?.name || item?.heading || "")}
                />
              )}
            </div>
          </section>
          {pageInclusions.length > 0 ? <Inclusions inclusions={pageInclusions} title={`${productPageName} Inclusions`} /> : null}
          <FaqList faqs={Array.isArray(data?.faqs) ? data.faqs : []} />
        </>
      )}
    </div>
  );
};

export default WarmOrganicTemplateServiceDetailPage;
