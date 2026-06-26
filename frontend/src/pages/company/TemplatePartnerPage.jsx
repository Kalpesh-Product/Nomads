import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../../utils/axios";
import LinedHeading from "./components/LinedHeading";

const TemplatePartnerPage = () => {
  const { data, isPending, error } = useOutletContext();
  const [partnerForm, setPartnerForm] = useState({
    name: "",
    email: "",
    mobile: "",
    message: "",
  });
  const [submitPending, setSubmitPending] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  if (isPending) return null;
  if (error) return <div>Error loading partner page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  const partnerPageHeading = String(data?.partnerPageHeading || "").trim() || "Become A Partner";
  const partnerPageContent = String(data?.partnerPageContent || "").trim();
  const partnerFormTitle = String(data?.partnerFormTitle || "").trim() || `Partner With ${data?.companyName || "Us"}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitPending(true);
    setSubmitError("");

    try {
      await api.post("/api/leads/create-lead", {
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

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to submit partner form", error);
      setSubmitError(
        error?.response?.data?.message || "Failed to submit. Please try again."
      );
    } finally {
      setSubmitPending(false);
    }
  };

  return (
    <section className="bg-[#efefef] px-4 py-10 md:px-6">
      <div className="mx-auto mt-6 w-full max-w-7xl">
        <LinedHeading title={partnerPageHeading} />
        
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Left: Content */}
          <div className="font-['Poppins',ui-sans-serif,system-ui,sans-serif] text-[15px] leading-[1.7] text-[#374151] md:text-[17px]">
            {partnerPageContent ? (
              partnerPageContent.split("\n").map((para, i) => (
                <p key={`partner-para-${i}`} className="mb-4 last:mb-0">
                  {para}
                </p>
              ))
            ) : (
              <p className="text-slate-400">Partner content coming soon.</p>
            )}
          </div>

          {/* Right: Form */}
          <div className="rounded-2xl bg-white p-6 shadow-md md:p-8">
            <h3 className="text-center text-[18px] font-semibold text-[#111827] md:text-[20px]">
              {partnerFormTitle}
            </h3>

            {submitSuccess ? (
              <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
                  ✓
                </div>
                <p className="mt-3 text-[16px] font-semibold text-green-700">
                  Thank you for your interest!
                </p>
                <p className="mt-1 text-[14px] text-green-600">
                  We'll get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={partnerForm.name}
                  onChange={(e) =>
                    setPartnerForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-[14px] outline-none transition focus:border-black"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={partnerForm.email}
                  onChange={(e) =>
                    setPartnerForm((p) => ({ ...p, email: e.target.value }))
                  }
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-[14px] outline-none transition focus:border-black"
                />
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  value={partnerForm.mobile}
                  onChange={(e) =>
                    setPartnerForm((p) => ({ ...p, mobile: e.target.value }))
                  }
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-[14px] outline-none transition focus:border-black"
                />
                <textarea
                  rows={4}
                  placeholder="Your Message"
                  value={partnerForm.message}
                  onChange={(e) =>
                    setPartnerForm((p) => ({ ...p, message: e.target.value }))
                  }
                  className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-[14px] outline-none transition focus:border-black"
                />
                {submitError ? (
                  <p className="text-[13px] text-red-600">{submitError}</p>
                ) : null}
                <button
                  type="submit"
                  disabled={submitPending}
                  className="w-full rounded-full bg-black px-6 py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-60"
                >
                  {submitPending ? "Submitting..." : "Connect"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TemplatePartnerPage;
