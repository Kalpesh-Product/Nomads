import React, { useState } from "react";
import { useTemplateData } from "./templates/useTemplateData";
import {
  BODY_FONT,
  FONT_IMPORT,
  HEADING_FONT,
  INPUT,
  LinedHeading,
  SECTION_BG,
  STYLE_OVERRIDES,
  TEMPLATE_ROOT_CLASS,
} from "./templates/emeraldStudio/EmeraldStudioShared";
import { api } from "../../utils/axios";

// Note: HostPanel's EmeraldStudioTemplate.tsx Partner section markup is a
// plain (non-<form>) div with a submit button that has no onClick wired —
// it's an in-app preview-only visual, never actually submits there. This
// Nomads port gives it a real working <form>/onSubmit (mirroring
// WarmOrganicTemplatePartnerPage.jsx / FreshStudioTemplatePartnerPage.jsx),
// and — per this session's own scope — posts to the correctly single-
// `/api/`-prefixed `/leads/create-lead` route from the start (the other
// three templates' Partner pages had a `/api/api/leads/create-lead`
// double-prefix bug that was fixed separately this session).
const EmeraldStudioTemplatePartnerPage = () => {
  const t = useTemplateData();
  const { data } = t;
  const [partnerForm, setPartnerForm] = useState({ name: "", email: "", mobile: "", message: "" });
  const [submitPending, setSubmitPending] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  if (t.isPending) return null;
  if (t.error) return <div>Error loading partner page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  const partnerPageHeading = String(data?.partnerPageHeading || "").trim() || "Become A Partner";
  const partnerPageContent = String(data?.partnerPageContent || "").trim();
  const partnerFormTitle = String(data?.partnerFormTitle || "").trim() || `Partner with ${data?.companyName || "us"}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitPending(true);
    setSubmitError("");
    try {
      await api.post("/leads/create-lead", {
        fullName: partnerForm.name,
        name: partnerForm.name,
        mobileNumber: partnerForm.mobile,
        mobile: partnerForm.mobile,
        phone: partnerForm.mobile,
        email: partnerForm.email,
        comment: partnerForm.message,
        message: partnerForm.message,
        source: "website",
        inquiryType: "Partner",
        companyName: data?.companyName || "",
        companyId: data?.companyId || "",
        workspaceId: data?.workspaceId || "",
        searchKey: data?.searchKey || "",
        vertical: data?.vertical || "",
        websiteUrl: window.location.href,
      });
      setSubmitSuccess(true);
      setPartnerForm({ name: "", email: "", mobile: "", message: "" });
      window.setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to submit partner form", error);
      setSubmitError(error?.response?.data?.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitPending(false);
    }
  };

  return (
    <div className={`${TEMPLATE_ROOT_CLASS} min-h-screen bg-[#002c22] text-stone-100 ${BODY_FONT}`}>
      <style>{`${FONT_IMPORT}${STYLE_OVERRIDES}`}</style>
      <section className={`pt-20 pb-24 px-6 ${SECTION_BG}`}>
        <div className="max-w-7xl mx-auto">
          <LinedHeading title={partnerPageHeading} className="justify-center" />
          <div className="grid md:grid-cols-2 gap-14 mt-12 text-left">
            <div className="text-stone-400 text-base leading-relaxed">
              {partnerPageContent ? (
                partnerPageContent.split("\n").map((p, i) => (
                  <p key={i} className="mb-4 last:mb-0">
                    {p}
                  </p>
                ))
              ) : (
                <p className="text-stone-500">Partner content coming soon.</p>
              )}
            </div>
            <div className="bg-emerald-900/30 border border-emerald-800/50 rounded-2xl p-8">
              <LinedHeading title={partnerFormTitle} />

              {submitSuccess ? (
                <div className="mt-4 rounded-xl border border-emerald-800/50 bg-emerald-900/40 p-6 text-center">
                  <h3 className={`text-lg font-semibold text-stone-100 mb-1 ${HEADING_FONT}`}>Thank you for your interest!</h3>
                  <p className="text-stone-400 text-sm">We&apos;ll get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <input
                    type="text"
                    placeholder="Your name"
                    required
                    value={partnerForm.name}
                    onChange={(e) => setPartnerForm((p) => ({ ...p, name: e.target.value }))}
                    className={INPUT}
                  />
                  <input
                    type="email"
                    placeholder="Your email"
                    required
                    value={partnerForm.email}
                    onChange={(e) => setPartnerForm((p) => ({ ...p, email: e.target.value }))}
                    className={INPUT}
                  />
                  <input
                    type="tel"
                    placeholder="Mobile number"
                    required
                    value={partnerForm.mobile}
                    onChange={(e) => setPartnerForm((p) => ({ ...p, mobile: e.target.value }))}
                    className={INPUT}
                  />
                  <textarea
                    rows={4}
                    placeholder="Your message"
                    value={partnerForm.message}
                    onChange={(e) => setPartnerForm((p) => ({ ...p, message: e.target.value }))}
                    className={INPUT}
                  />
                  {submitError ? <p className="text-xs text-red-400">{submitError}</p> : null}
                  <button
                    type="submit"
                    disabled={submitPending}
                    className="w-full bg-amber-400 text-emerald-950 font-semibold py-3.5 rounded-lg hover:bg-amber-300 transition-colors text-sm disabled:opacity-50"
                  >
                    {submitPending ? "Submitting…" : "Connect"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EmeraldStudioTemplatePartnerPage;
