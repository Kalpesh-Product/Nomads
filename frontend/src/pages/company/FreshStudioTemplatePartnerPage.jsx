import React, { useState } from "react";
import { useTemplateData } from "./templates/useTemplateData";
import {
  ACCENT,
  ACCENT_GRADIENT,
  CARD,
  FONT_IMPORT,
  HEADING,
  INPUT,
  LinedHeading,
  MUTED,
  PAGE_BG,
  PAGE_WRAP,
  PILL_BUTTON,
  TEXT,
  WHITE,
  focusStyle,
  inputFocusStyle,
  inputStyle,
} from "./templates/freshStudio/FreshStudioShared";
import { api } from "../../utils/axios";

const FreshStudioTemplatePartnerPage = () => {
  const t = useTemplateData();
  const { data } = t;
  const [partnerForm, setPartnerForm] = useState({ name: "", email: "", mobile: "", message: "" });
  const [submitPending, setSubmitPending] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  if (t.isPending) return null;
  if (t.error) return <div>Error loading partner page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  const partnerPageHeading = String(data?.partnerPageHeading || "").trim() || "Become a partner";
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
    <div className="min-h-screen font-['Work_Sans',ui-sans-serif,system-ui,sans-serif]" style={{ backgroundColor: PAGE_BG, color: TEXT }}>
      <style>{FONT_IMPORT}</style>
      <section className={PAGE_WRAP}>
        <LinedHeading title={partnerPageHeading} className="mb-6" style={{ color: ACCENT }} />
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="text-[14.5px] leading-relaxed">
            {partnerPageContent ? (
              partnerPageContent.split("\n").map((p, i) => (
                <p key={i} className="mb-4 last:mb-0">
                  {p}
                </p>
              ))
            ) : (
              <p style={{ color: MUTED }}>Partner content coming soon.</p>
            )}
          </div>
          <div className={`${CARD} border p-6`} style={{ borderColor: "rgba(255,255,255,0.12)" }}>
            <h3 className="text-center text-[18px] font-semibold md:text-[20px]" style={{ color: HEADING }}>
              {partnerFormTitle}
            </h3>

            {submitSuccess ? (
              <div className="mt-6 rounded-[4px] border p-6 text-center" style={{ borderColor: "rgba(217,75,75,0.4)" }}>
                <p className="text-[14px] font-semibold" style={{ color: HEADING }}>
                  Thank you for your interest!
                </p>
                <p className="mt-1 text-[13px]" style={{ color: MUTED }}>
                  We'll get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Your name"
                  required
                  value={partnerForm.name}
                  onChange={(e) => setPartnerForm((p) => ({ ...p, name: e.target.value }))}
                  className={INPUT}
                  style={{ ...inputStyle, ...inputFocusStyle }}
                />
                <input
                  type="email"
                  placeholder="Your email"
                  required
                  value={partnerForm.email}
                  onChange={(e) => setPartnerForm((p) => ({ ...p, email: e.target.value }))}
                  className={INPUT}
                  style={{ ...inputStyle, ...inputFocusStyle }}
                />
                <input
                  type="tel"
                  placeholder="Mobile number"
                  required
                  value={partnerForm.mobile}
                  onChange={(e) => setPartnerForm((p) => ({ ...p, mobile: e.target.value }))}
                  className={INPUT}
                  style={{ ...inputStyle, ...inputFocusStyle }}
                />
                <textarea
                  rows={4}
                  placeholder="Your message"
                  value={partnerForm.message}
                  onChange={(e) => setPartnerForm((p) => ({ ...p, message: e.target.value }))}
                  className={INPUT}
                  style={{ ...inputStyle, ...inputFocusStyle }}
                />
                {submitError ? <p className="text-[12px] text-[#D94B4B]">{submitError}</p> : null}
                <button
                  type="submit"
                  disabled={submitPending}
                  className={`${PILL_BUTTON} disabled:opacity-50`}
                  style={{ background: ACCENT_GRADIENT, color: WHITE, ...focusStyle }}
                >
                  {submitPending ? "Submitting…" : "Connect"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FreshStudioTemplatePartnerPage;
