import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Country, State, City } from "country-state-city";
import { isValidPhoneNumber, validatePhoneNumberLength } from "libphonenumber-js";
import axios from "axios";
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

// Same department ordering Nomads' own ClassicTemplateCareerPage.jsx /
// FreshStudioTemplateCareerPage.jsx / WarmOrganicTemplateCareerPage.jsx use.
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
// Same 3-line fallback HostPanel's useWebsiteTemplateData hook exposes as
// `careersFallbackIntro` — shown only when the company hasn't written its
// own careersPageIntro.
const CAREERS_FALLBACK_INTRO = [
  "We are a focused, young company building the foundation for destination-based lifestyle experiences.",
  "We are connecting ambitious people with a healthier way to work and live, while helping brands and communities grow.",
  "Join our team if you want to help shape a platform that blends operations, service, and technology into one experience.",
];

const getCareersJobTitle = (job) => String(job?.title || job?.designation || job?.name || "Untitled Role").trim();

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

// Emerald Studio's HostPanel source (EmeraldStudioTemplate.tsx) renders
// aboutTheJob/keyResponsibilities/requirements as plain whitespace-pre-wrap
// paragraphs (no bullet-splitting, no softSkills block, no resume-fallback
// closing block) — ported faithfully as-is, same as Warm Organic's port.
// The apply-form card itself is full-width (bg-emerald-900/30 border
// border-emerald-800/50 rounded-2xl p-8, grid md:grid-cols-2), matching the
// bug fix already applied to HostPanel's source this session (previously it
// was constrained to max-w-2xl).
const EmeraldStudioTemplateCareerPage = () => {
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

  return (
    <div className={`${TEMPLATE_ROOT_CLASS} min-h-screen bg-[#002c22] text-stone-100 ${BODY_FONT}`}>
      <style>{`${FONT_IMPORT}${STYLE_OVERRIDES}`}</style>
      <section className={`pt-20 pb-24 px-6 ${SECTION_BG}`}>
        <div className="max-w-7xl mx-auto">
          {!selectedJob ? (
            <>
              <LinedHeading title={companyName ? `Join Our Team - ${companyName}` : "Join Our Team - Company Name"} className="justify-center" />
              <div className="text-stone-400 text-lg max-w-2xl mx-auto text-center leading-relaxed mb-12">
                {introParagraphs.map((p, i) => (
                  <p key={i} className="mb-3 last:mb-0">
                    {p}
                  </p>
                ))}
              </div>

              {jobsLoading ? (
                <p className="text-stone-500">Loading open roles…</p>
              ) : jobs.length === 0 ? (
                <p className="text-stone-500">No job openings at the moment — check back later.</p>
              ) : (
                <div className="space-y-4">
                  {departments.map((dept) => {
                    const isOpen = openDept === dept.department;
                    return (
                      <div key={dept.department} className="bg-emerald-900/40 border border-emerald-800/50 rounded-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setOpenDept(isOpen ? "" : dept.department)}
                          className="w-full flex items-center justify-between px-7 py-5 text-left"
                        >
                          <span className={`font-semibold text-lg text-stone-100 ${HEADING_FONT}`}>
                            {dept.ordinal}. {dept.department}
                          </span>
                          <span className="text-amber-400">{isOpen ? "−" : "+"}</span>
                        </button>
                        {isOpen ? (
                          <div className="px-7 pb-5 space-y-1">
                            {dept.jobs.map((job, idx) => (
                              <button
                                key={job.jobCode || idx}
                                type="button"
                                onClick={() => handleSelectJob({ ...job, department: dept.department })}
                                className="w-full flex items-center justify-between border-t border-emerald-800/40 py-4 text-left hover:text-amber-400 transition-colors"
                              >
                                <div>
                                  <p className="font-medium text-stone-100 text-sm">{job?.title || job?.designation || job?.name}</p>
                                  <p className="text-stone-500 text-xs mt-0.5">{job?.location || ""}</p>
                                </div>
                                <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">{applyBtnText} →</span>
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
                    className="mt-8 inline-flex items-center gap-2 border border-emerald-700 text-stone-300 font-medium px-7 py-3.5 rounded hover:border-amber-400 hover:text-amber-400 transition-colors text-sm"
                  >
                    General Application
                  </button>
                  {careersClosingText || careersClosingHeading ? (
                    <div className="mt-12 text-center">
                      {careersClosingHeading ? (
                        <p className={`text-lg font-semibold text-stone-100 ${HEADING_FONT}`}>{careersClosingHeading}</p>
                      ) : null}
                      {careersClosingText ? <p className="mt-2 text-stone-400 text-sm leading-relaxed">{careersClosingText}</p> : null}
                    </div>
                  ) : null}
                </div>
              )}
            </>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => t.goToSection("careers")}
                className="text-sm font-medium text-amber-400 hover:text-amber-300 underline underline-offset-4 mb-6"
              >
                ← Back to Careers
              </button>
              <h1 className={`text-4xl md:text-5xl font-semibold text-stone-100 mb-6 ${HEADING_FONT}`}>
                {isGeneral ? "General Application" : getCareersJobTitle(selectedJob)}
              </h1>

              {!isGeneral ? (
                <div className="flex gap-6 border-b border-emerald-800/50 mb-8">
                  <button
                    type="button"
                    onClick={() => setActiveTab("description")}
                    className={`pb-3 text-xs font-semibold uppercase tracking-widest transition-colors ${
                      activeTab === "description" ? "text-amber-400 border-b-2 border-amber-400" : "text-stone-500 hover:text-stone-300"
                    }`}
                  >
                    Description
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("apply")}
                    className={`pb-3 text-xs font-semibold uppercase tracking-widest transition-colors ${
                      activeTab === "apply" ? "text-amber-400 border-b-2 border-amber-400" : "text-stone-500 hover:text-stone-300"
                    }`}
                  >
                    Apply
                  </button>
                </div>
              ) : null}

              {activeTab === "description" && !isGeneral ? (
                <div className="max-w-2xl space-y-6 text-stone-400 text-base leading-relaxed">
                  {selectedJob?.aboutTheJob ? (
                    <div>
                      <p className="font-semibold text-stone-100 mb-1">About this role</p>
                      <p className="whitespace-pre-wrap">{selectedJob.aboutTheJob}</p>
                    </div>
                  ) : null}
                  {selectedJob?.keyResponsibilities ? (
                    <div>
                      <p className="font-semibold text-stone-100 mb-1">Key responsibilities</p>
                      <p className="whitespace-pre-wrap">{selectedJob.keyResponsibilities}</p>
                    </div>
                  ) : null}
                  {selectedJob?.requirements ? (
                    <div>
                      <p className="font-semibold text-stone-100 mb-1">Requirements</p>
                      <p className="whitespace-pre-wrap">{selectedJob.requirements}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {activeTab === "apply" || isGeneral ? (
                <div>
                  {submitSuccess ? (
                    <div className="bg-emerald-900/30 border border-emerald-800/50 rounded-2xl p-8 text-center">
                      <div className="w-14 h-14 rounded-full bg-amber-400 flex items-center justify-center text-emerald-950 text-2xl mb-4 mx-auto">✓</div>
                      <h3 className={`text-xl font-semibold text-stone-100 mb-2 ${HEADING_FONT}`}>Application submitted!</h3>
                      <p className="text-stone-400 text-sm">We&apos;ll review it and get back to you shortly.</p>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSubmit}
                      className="bg-emerald-900/30 border border-emerald-800/50 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div>
                        <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={form.fullName}
                          onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                          className={INPUT}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Email *</label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                          className={INPUT}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Date of Birth *</label>
                        <input
                          type="date"
                          required
                          value={form.dateOfBirth}
                          onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                          className={INPUT}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Country *</label>
                        <select
                          required
                          value={form.country}
                          onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                          className={INPUT}
                        >
                          <option value="">Select country</option>
                          {applyCountryList.map((c) => (
                            <option key={c.isoCode} value={c.isoCode}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">State *</label>
                        <select
                          required
                          disabled={!form.country}
                          value={form.state}
                          onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                          className={`${INPUT} disabled:opacity-50`}
                        >
                          <option value="">Select state</option>
                          {applyStateList.map((s) => (
                            <option key={s.isoCode} value={s.isoCode}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">City *</label>
                        <select
                          required
                          disabled={!form.state}
                          value={form.city}
                          onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                          className={`${INPUT} disabled:opacity-50`}
                        >
                          <option value="">Select city</option>
                          {applyCityList.map((c) => (
                            <option key={c.name} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Phone *</label>
                        <div className="flex items-stretch">
                          <span className="flex shrink-0 items-center border border-r-0 border-emerald-800 bg-emerald-950/60 px-3 text-sm text-stone-500 rounded-l-lg">
                            {applyDialCode || "+ --"}
                          </span>
                          <input
                            type="tel"
                            required
                            value={form.phone}
                            onChange={(e) => {
                              const cleaned = e.target.value.replace(/[^\d\s-]/g, "");
                              const digits = cleaned.replace(/\D/g, "");
                              if (form.country && digits && validatePhoneNumberLength(digits, form.country) === "TOO_LONG") return;
                              setForm((p) => ({ ...p, phone: cleaned }));
                            }}
                            className="flex-1 bg-emerald-950/60 border border-emerald-800 rounded-r-lg px-4 py-3 text-stone-100 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="flex cursor-pointer items-center justify-between border border-dashed border-emerald-700 px-4 py-3 text-sm rounded-lg hover:border-amber-400 transition-colors">
                          <span className="text-stone-300">{resumeFile ? resumeFile.name : "Upload resume / CV *"}</span>
                          <span className="border border-emerald-700 px-3 py-1 text-xs uppercase tracking-wider text-stone-400 rounded">Choose file</span>
                          <input
                            type="file"
                            required
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                          />
                        </label>
                      </div>
                      {careersFormFields.map((field) =>
                        field.type === "textarea" ? (
                          <div key={field.id} className="md:col-span-2">
                            <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
                              {field.label}
                              {field.required ? " *" : ""}
                            </label>
                            <textarea
                              rows={3}
                              required={field.required}
                              value={customValues[field.id] || ""}
                              onChange={(e) => setCustomValues((p) => ({ ...p, [field.id]: e.target.value }))}
                              className={INPUT}
                            />
                          </div>
                        ) : field.type === "select" ? (
                          <div key={field.id} className={field.fullWidth ? "md:col-span-2" : ""}>
                            <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
                              {field.label}
                              {field.required ? " *" : ""}
                            </label>
                            <select
                              required={field.required}
                              value={customValues[field.id] || ""}
                              onChange={(e) => setCustomValues((p) => ({ ...p, [field.id]: e.target.value }))}
                              className={INPUT}
                            >
                              <option value="">Select</option>
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
                          </div>
                        ) : (
                          <div key={field.id} className={field.fullWidth ? "md:col-span-2" : ""}>
                            <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
                              {field.label}
                              {field.required ? " *" : ""}
                            </label>
                            <input
                              type="text"
                              required={field.required}
                              value={customValues[field.id] || ""}
                              onChange={(e) => setCustomValues((p) => ({ ...p, [field.id]: e.target.value }))}
                              className={INPUT}
                            />
                          </div>
                        ),
                      )}
                      {submitError ? <p className="md:col-span-2 text-xs text-red-400">{submitError}</p> : null}
                      <div className="md:col-span-2">
                        <button
                          type="submit"
                          disabled={submitPending}
                          className="w-full bg-amber-400 text-emerald-950 font-semibold py-3.5 rounded-lg hover:bg-amber-300 transition-colors text-sm disabled:opacity-50"
                        >
                          {submitPending ? "Submitting…" : "Submit Application"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default EmeraldStudioTemplateCareerPage;
