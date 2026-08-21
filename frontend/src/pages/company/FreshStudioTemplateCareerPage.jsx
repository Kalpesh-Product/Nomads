import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Country, State, City } from "country-state-city";
import { isValidPhoneNumber, validatePhoneNumberLength } from "libphonenumber-js";
import axios from "axios";
import { useTemplateData } from "./templates/useTemplateData";
import {
  ACCENT,
  ACCENT_GRADIENT,
  CARD,
  FONT_IMPORT,
  HEADING,
  HEADING_FONT,
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

// Same department ordering Nomads' own ClassicTemplateCareerPage.jsx uses
// (kept slightly more complete than HostPanel's copy — it has a couple of
// Kaffe-specific departments HostPanel's list doesn't) so Fresh Studio's
// grouping matches its Classic sibling in this repo rather than reverting to
// an older list.
const CAREERS_DEFAULT_DEPARTMENT_ORDER = [
  "Product & Tech Development",
  "Tech",
  "Technology",
  "Networking & IT",
  "IT",
  "Finance",
  "Human Resource & EA",
  "HR",
  "Human Resources",
  "Sales & Business Development",
  "Sales",
  "Administration & Front office",
  "Administration",
  "Marketing",
  "Legal",
  "Kaffe Operation",
  "Kaffe Kitchen",
  "Internships Across Departments",
  "Civil & Maintenance",
  "Service & Maintenance",
  "Maintenance",
];
const CAREERS_ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII"];
const CAREERS_FALLBACK_INTRO = [
  "We are a focused, young company building the foundation for destination-based lifestyle experiences.",
  "Join our team if you want to help shape a platform that blends operations, service, and technology into one experience.",
];

const getCareersJobTitle = (job) => String(job?.title || job?.designation || job?.name || "Untitled Role").trim();

const formatCareersMetaValue = (value, mode) => {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  if (mode === "employmentType") {
    if (raw === "full_time") return "FULL TIME";
    if (raw === "part_time") return "PART TIME";
    if (raw === "intern") return "INTERN";
    if (raw === "contractor") return "CONTRACTOR";
    if (raw === "trainee") return "TRAINEE";
  }
  if (mode === "workMode") {
    if (raw === "on_site" || raw === "onsite" || raw === "on-site" || raw === "on site") return "ON-SITE";
    if (raw === "remote") return "REMOTE";
    if (raw === "hybrid") return "HYBRID";
  }
  return raw.replace(/_/g, " ").toUpperCase();
};

const getCareersJobMeta = (job) => {
  const meta = [
    formatCareersMetaValue(job?.employmentTypeLabel || job?.employmentType, "employmentType"),
    formatCareersMetaValue(job?.workMode, "workMode"),
    formatCareersMetaValue(job?.location),
  ]
    .map((v) => String(v || "").trim())
    .filter(Boolean)
    .map((v) => v.replace(/_/g, " "));
  return meta.length ? meta.join(" | ") : "Apply now to view the full role details.";
};

const parseCareersFormFields = (value) => {
  try {
    const raw = typeof value === "string" ? JSON.parse(value || "[]") : value;
    if (!Array.isArray(raw)) return [];
    return raw
      .map((field, index) => ({
        id: String(field?.id || `field_${index}`),
        type: ["text", "textarea", "select", "number", "email", "tel"].includes(String(field?.type || "text"))
          ? String(field?.type || "text")
          : "text",
        label: String(field?.label || "").trim(),
        required: field?.required === true,
        options: String(field?.options || ""),
        fullWidth: field?.fullWidth === true,
      }))
      .filter((field) => field.label || field.id);
  } catch {
    return [];
  }
};

const bulletsFromDotSplit = (text) =>
  String(text || "")
    .split(/\.\s+/)
    .map((s) => s.replace(/\.$/, "").trim())
    .filter(Boolean);

const FreshStudioTemplateCareerPage = () => {
  const t = useTemplateData();
  const { data } = t;
  const { jobCode } = useParams();

  const [activeTab, setActiveTab] = useState("description");
  const [openDept, setOpenDept] = useState("");
  const [form, setForm] = useState({ fullName: "", email: "", dateOfBirth: "", phone: "", country: "", state: "", city: "" });
  const [customValues, setCustomValues] = useState({});
  const [resumeFile, setResumeFile] = useState(null);
  const [submitPending, setSubmitPending] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [applyCountryList] = useState(() => Country.getAllCountries());
  const [applyStateList, setApplyStateList] = useState([]);
  const [applyCityList, setApplyCityList] = useState([]);

  const workspaceId = data?.workspaceId || "";
  const companyName = data?.companyName || "";
  const companyLogo = data?.companyLogoUrl || "";
  const email = data?.websiteEmail || data?.email || "";
  const careersFormFields = useMemo(() => parseCareersFormFields(data?.careersFormFields), [data?.careersFormFields]);

  const applyDialCode = useMemo(() => {
    if (!form.country) return "";
    const code = String(Country.getCountryByCode(form.country)?.phonecode || "").trim();
    if (!code) return "";
    return code.startsWith("+") ? code : `+${code}`;
  }, [form.country]);

  const { data: jobsData, isPending: jobsLoading } = useQuery({
    queryKey: ["career-jobs", workspaceId],
    queryFn: async () => {
      const res = await api.get(`/editor/get-jobs/${workspaceId}`);
      return res.data?.data || res.data?.jobs || res.data || [];
    },
    enabled: !!workspaceId,
  });
  const jobs = useMemo(() => (Array.isArray(jobsData) ? jobsData : []), [jobsData]);

  const isGeneral = jobCode === "GENERAL";
  const selectedJob = useMemo(() => {
    if (!jobCode) return null;
    if (isGeneral) return { jobTitle: "General Application", jobCode: "GENERAL" };
    return jobs.find((j) => j.jobCode === jobCode) || null;
  }, [jobCode, isGeneral, jobs]);

  useEffect(() => {
    setActiveTab(isGeneral ? "apply" : "description");
    if (selectedJob?.department) setOpenDept(selectedJob.department);
  }, [jobCode, isGeneral, selectedJob]);

  useEffect(() => {
    if (!form.country) {
      setApplyStateList([]);
      setApplyCityList([]);
      return;
    }
    setApplyStateList(State.getStatesOfCountry(form.country));
    setApplyCityList([]);
    setForm((p) => ({ ...p, state: "", city: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.country]);

  useEffect(() => {
    if (!form.country || !form.state) {
      setApplyCityList([]);
      return;
    }
    setApplyCityList(City.getCitiesOfState(form.country, form.state));
    setForm((p) => ({ ...p, city: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.country, form.state]);

  const departments = useMemo(() => {
    const grouped = new Map();
    jobs.forEach((job) => {
      const dept = String(job?.department || "").trim() || "Open Positions";
      if (!grouped.has(dept)) grouped.set(dept, []);
      grouped.get(dept).push(job);
    });
    const ordered = [
      ...CAREERS_DEFAULT_DEPARTMENT_ORDER,
      ...Array.from(grouped.keys()).filter((d) => !CAREERS_DEFAULT_DEPARTMENT_ORDER.includes(d)).sort(),
    ].filter((d, i, arr) => arr.indexOf(d) === i && grouped.has(d));
    return ordered.map((dept, i) => ({ department: dept, ordinal: CAREERS_ROMAN[i] || String(i + 1), jobs: grouped.get(dept) }));
  }, [jobs]);

  const resetForm = () => {
    setForm({ fullName: "", email: "", dateOfBirth: "", phone: "", country: "", state: "", city: "" });
    setCustomValues({});
    setResumeFile(null);
    setSubmitSuccess(false);
    setSubmitError("");
  };

  const handleSelectJob = (job) => {
    resetForm();
    t.goToCareerJob(job.jobCode || "", getCareersJobTitle(job));
  };

  const handleGeneralApply = () => {
    resetForm();
    t.goToCareerJob("GENERAL", "General Application");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    const phoneDigits = form.phone.replace(/\D/g, "");
    if (form.country && !isValidPhoneNumber(phoneDigits, form.country)) {
      setSubmitError(`Please enter a valid mobile number for the selected country (${applyDialCode}).`);
      return;
    }

    setSubmitPending(true);
    setSubmitError("");
    try {
      const fd = new FormData();
      fd.append("workspaceId", workspaceId);
      fd.append("jobCode", selectedJob.jobCode || "");
      fd.append("jobTitle", getCareersJobTitle(selectedJob));
      fd.append("fullName", form.fullName);
      fd.append("email", form.email);
      fd.append("dateOfBirth", form.dateOfBirth);
      fd.append("phone", applyDialCode && form.phone ? `${applyDialCode} ${form.phone.trim()}` : form.phone);
      fd.append("country", form.country);
      fd.append("state", form.state);
      fd.append("city", form.city);
      fd.append("customFields", JSON.stringify(customValues));
      if (resumeFile) fd.append("resumeFile", resumeFile);

      const masterPanelBaseUrl = import.meta.env.VITE_MASTER_PANEL_BE_URL || "http://localhost:5007";
      await axios.post(`${masterPanelBaseUrl}/api/recruitment/jobs/apply`, fd);

      setSubmitSuccess(true);
      window.setTimeout(() => {
        setSubmitSuccess(false);
        resetForm();
        t.goToSection("careers");
      }, 3000);
    } catch (err) {
      setSubmitError(err?.response?.data?.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitPending(false);
    }
  };

  if (t.isPending) return null;
  if (t.error) return <div>Error loading careers page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  const careersPageIntro = String(data?.careersPageIntro || "").trim();
  const careersClosingText = String(data?.careersClosingText || "").trim();
  const careersClosingHeading = String(data?.careersClosingHeading || "").trim();
  const applyBtnText = String(data?.careersApplyButtonText || "").trim() || "Apply Now";
  const introParagraphs = careersPageIntro ? careersPageIntro.split("\n").filter(Boolean) : CAREERS_FALLBACK_INTRO;

  const renderFormFields = () => (
    <>
      <input
        type="text"
        required
        placeholder="Full name *"
        value={form.fullName}
        onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
        className={INPUT}
        style={{ ...inputStyle, ...inputFocusStyle }}
      />
      <input
        type="email"
        required
        placeholder="Email *"
        value={form.email}
        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        className={INPUT}
        style={{ ...inputStyle, ...inputFocusStyle }}
      />
      <input
        type="date"
        required
        value={form.dateOfBirth}
        onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
        className={INPUT}
        style={{ ...inputStyle, ...inputFocusStyle }}
      />
      <select
        required
        value={form.country}
        onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
        className={INPUT}
        style={{ ...inputStyle, ...inputFocusStyle }}
      >
        <option value="">Country *</option>
        {applyCountryList.map((c) => (
          <option key={c.isoCode} value={c.isoCode}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        required
        value={form.state}
        disabled={!form.country}
        onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
        className={`${INPUT} disabled:opacity-50`}
        style={{ ...inputStyle, ...inputFocusStyle }}
      >
        <option value="">State *</option>
        {applyStateList.map((s) => (
          <option key={s.isoCode} value={s.isoCode}>
            {s.name}
          </option>
        ))}
      </select>
      <select
        required
        value={form.city}
        disabled={!form.state}
        onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
        className={`${INPUT} disabled:opacity-50`}
        style={{ ...inputStyle, ...inputFocusStyle }}
      >
        <option value="">City *</option>
        {applyCityList.map((c) => (
          <option key={c.name} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>
      <div className="flex items-stretch overflow-hidden rounded-[4px]" style={inputStyle}>
        <span
          className="flex shrink-0 items-center border px-3 text-[13px]"
          style={{ borderColor: "rgba(255,255,255,0.22)", color: MUTED, backgroundColor: "#1c1c26" }}
        >
          {applyDialCode || "+ --"}
        </span>
        <input
          type="tel"
          required
          placeholder="Mobile number *"
          value={form.phone}
          onChange={(e) => {
            const cleaned = e.target.value.replace(/[^\d\s-]/g, "");
            const digits = cleaned.replace(/\D/g, "");
            if (form.country && digits && validatePhoneNumberLength(digits, form.country) === "TOO_LONG") return;
            setForm((p) => ({ ...p, phone: cleaned }));
          }}
          className="w-full border px-3 py-2.5 text-[14px] bg-[#14141c]"
          style={{ borderColor: "rgba(255,255,255,0.22)", color: TEXT }}
        />
      </div>
      <label
        className="flex cursor-pointer items-center justify-between rounded-[4px] border px-3 py-2.5 text-[13px]"
        style={{ borderColor: "rgba(255,255,255,0.22)", color: MUTED }}
      >
        <span>{resumeFile ? resumeFile.name : "Upload resume / CV *"}</span>
        <span className="rounded-[3px] border px-2 py-1 text-[11px] uppercase tracking-wider" style={{ borderColor: "rgba(255,255,255,0.18)" }}>
          Choose file
        </span>
        <input type="file" required accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
      </label>
      {careersFormFields.map((field) =>
        field.type === "textarea" ? (
          <textarea
            key={field.id}
            rows={3}
            required={field.required}
            placeholder={`${field.label}${field.required ? " *" : ""}`}
            value={customValues[field.id] || ""}
            onChange={(e) => setCustomValues((p) => ({ ...p, [field.id]: e.target.value }))}
            className={`md:col-span-2 ${INPUT}`}
            style={{ ...inputStyle, ...inputFocusStyle }}
          />
        ) : field.type === "select" ? (
          <select
            key={field.id}
            required={field.required}
            value={customValues[field.id] || ""}
            onChange={(e) => setCustomValues((p) => ({ ...p, [field.id]: e.target.value }))}
            className={field.fullWidth ? `md:col-span-2 ${INPUT}` : INPUT}
            style={{ ...inputStyle, ...inputFocusStyle }}
          >
            <option value="">{`${field.label}${field.required ? " *" : ""}`}</option>
            {String(field.options || "")
              .split(",")
              .map((o) => o.trim())
              .filter(Boolean)
              .map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
          </select>
        ) : (
          <input
            key={field.id}
            type="text"
            required={field.required}
            placeholder={`${field.label}${field.required ? " *" : ""}`}
            value={customValues[field.id] || ""}
            onChange={(e) => setCustomValues((p) => ({ ...p, [field.id]: e.target.value }))}
            className={field.fullWidth ? `md:col-span-2 ${INPUT}` : INPUT}
            style={{ ...inputStyle, ...inputFocusStyle }}
          />
        ),
      )}
    </>
  );

  return (
    <div className="min-h-screen font-['Work_Sans',ui-sans-serif,system-ui,sans-serif]" style={{ backgroundColor: PAGE_BG, color: TEXT }}>
      <style>{FONT_IMPORT}</style>
      <section className={PAGE_WRAP}>
        {!selectedJob ? (
          <>
            <LinedHeading title={companyName ? `Join ${companyName}` : "Join our team"} className="mb-6" style={{ color: ACCENT }} />
            <div className="mx-auto max-w-2xl text-center text-[14.5px] leading-relaxed">
              {introParagraphs.map((p, i) => (
                <p key={i} className="mb-3 last:mb-0">
                  {p}
                </p>
              ))}
            </div>

            {jobsLoading ? (
              <p className="mt-8 text-center text-[13px]" style={{ color: MUTED }}>
                Loading open roles…
              </p>
            ) : jobs.length === 0 ? (
              <p className="mt-8 text-center text-[13px]" style={{ color: MUTED }}>
                No job openings at the moment — check back later.
              </p>
            ) : (
              <div className="mt-9 flex flex-col gap-2">
                {departments.map((dept) => {
                  const isOpen = openDept === dept.department;
                  return (
                    <div key={dept.department} className={`${CARD} border`} style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                      <button
                        type="button"
                        onClick={() => setOpenDept(isOpen ? "" : dept.department)}
                        className="flex w-full items-center justify-between p-4 text-left focus-visible:outline focus-visible:outline-2"
                        style={focusStyle}
                      >
                        <span className="text-[14.5px] font-semibold" style={{ color: HEADING }}>
                          {dept.ordinal}. {dept.department}
                        </span>
                        <span style={{ color: ACCENT }}>{isOpen ? "−" : "+"}</span>
                      </button>
                      {isOpen ? (
                        <div className="flex flex-col gap-1 px-4 pb-4">
                          {dept.jobs.map((job, idx) => (
                            <button
                              key={job.jobCode || idx}
                              type="button"
                              onClick={() => handleSelectJob({ ...job, department: dept.department })}
                              className="flex items-center justify-between rounded-[4px] px-3 py-2.5 text-left transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2"
                              style={focusStyle}
                            >
                              <div className="min-w-0">
                                <p className="text-[13.5px] font-medium">{getCareersJobTitle(job)}</p>
                                <p className="mt-0.5 text-[11.5px]" style={{ color: MUTED }}>
                                  {getCareersJobMeta(job)}
                                </p>
                              </div>
                              <span className="shrink-0 text-[12px] font-semibold" style={{ color: ACCENT }}>
                                {applyBtnText} →
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={handleGeneralApply}
                  className={`${PILL_BUTTON} mt-4 self-start`}
                  style={{ border: `1px solid ${ACCENT}`, color: ACCENT, backgroundColor: WHITE, ...focusStyle }}
                >
                  General application
                </button>
              </div>
            )}

            <div className="mt-10 flex flex-col items-center border-t pt-8 text-center" style={{ borderColor: "rgba(255,255,255,0.10)" }}>
              {companyLogo ? (
                <img src={companyLogo} alt={companyName} className="h-12 object-contain" />
              ) : companyName ? (
                <p className="text-[16px] font-semibold" style={{ color: HEADING }}>
                  {companyName}
                </p>
              ) : null}
              <p className="mt-4 max-w-lg text-[14px] leading-7" style={{ color: MUTED }}>
                {careersClosingText || "Please send in your resume here on Apply Now if you cannot find your department of interest."}
              </p>
              <p className="mt-1 text-[12px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                {careersClosingHeading || "*Mention your applying department in the message box"}
              </p>
            </div>
          </>
        ) : (
          <div>
            <button type="button" onClick={() => t.goToSection("careers")} className="text-[13px] font-semibold focus-visible:outline focus-visible:outline-2" style={{ color: ACCENT, ...focusStyle }}>
              ← Back
            </button>
            <h2 className={`mt-4 text-center text-[24px] font-extrabold ${HEADING_FONT}`} style={{ color: HEADING }}>
              {isGeneral ? "General Application" : getCareersJobTitle(selectedJob)}
            </h2>

            {!isGeneral ? (
              <div className="mt-6 flex gap-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
                <button
                  type="button"
                  onClick={() => setActiveTab("description")}
                  className="pb-3 text-[13px] font-semibold"
                  style={{ color: activeTab === "description" ? ACCENT : MUTED, borderBottom: activeTab === "description" ? `2px solid ${ACCENT}` : "2px solid transparent" }}
                >
                  Description
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("apply")}
                  className="pb-3 text-[13px] font-semibold"
                  style={{ color: activeTab === "apply" ? ACCENT : MUTED, borderBottom: activeTab === "apply" ? `2px solid ${ACCENT}` : "2px solid transparent" }}
                >
                  Apply
                </button>
              </div>
            ) : null}

            {activeTab === "description" && !isGeneral ? (
              <div className="mt-8 flex flex-col gap-6 text-[14px] leading-relaxed">
                {selectedJob?.aboutTheJob ? (
                  <div>
                    <p className="font-semibold" style={{ color: HEADING }}>
                      About this role
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">{selectedJob.aboutTheJob}</p>
                  </div>
                ) : null}
                {selectedJob?.keyResponsibilities ? (
                  <div>
                    <p className="font-semibold" style={{ color: HEADING }}>
                      Key responsibilities
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      {bulletsFromDotSplit(selectedJob.keyResponsibilities).map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {selectedJob?.requirements ? (
                  <div>
                    <p className="font-semibold" style={{ color: HEADING }}>
                      Requirements
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      {bulletsFromDotSplit(selectedJob.requirements).map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {selectedJob?.softSkills ? (
                  <div>
                    <p className="font-semibold" style={{ color: HEADING }}>
                      Soft skills
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      {bulletsFromDotSplit(selectedJob.softSkills).map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="mt-2 pt-6 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }}>
                  {companyLogo ? (
                    <img src={companyLogo} alt={companyName} className="mx-auto h-12 object-contain" />
                  ) : companyName ? (
                    <p className="text-[16px] font-semibold" style={{ color: HEADING }}>
                      {companyName}
                    </p>
                  ) : null}
                  {email ? (
                    <p className="mt-3 text-[14px] leading-7">
                      Please send in your resume to{" "}
                      <span className="font-semibold" style={{ color: HEADING }}>
                        Email: {email}
                      </span>{" "}
                      if unable to apply now.
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {activeTab === "apply" || isGeneral ? (
              <div className="mt-8">
                {submitSuccess ? (
                  <div className={`${CARD} border p-6 text-center`} style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                    <p className="text-[14px] font-semibold" style={{ color: HEADING }}>
                      Application submitted!
                    </p>
                    <p className="mt-1 text-[13px]" style={{ color: MUTED }}>
                      We'll review it and get back to you shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className={`${CARD} border grid grid-cols-1 gap-3 p-6 md:grid-cols-2 md:p-7`} style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                    {renderFormFields()}
                    {submitError ? <p className="md:col-span-2 text-[12px] text-[#D94B4B]">{submitError}</p> : null}
                    <button
                      type="submit"
                      disabled={submitPending}
                      className={`${PILL_BUTTON} md:col-span-2 disabled:opacity-50`}
                      style={{ background: ACCENT_GRADIENT, color: WHITE, ...focusStyle }}
                    >
                      {submitPending ? "Submitting…" : "Submit application"}
                    </button>
                  </form>
                )}
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
};

export default FreshStudioTemplateCareerPage;
