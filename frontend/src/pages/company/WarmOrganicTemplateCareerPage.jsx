import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Country, State, City } from "country-state-city";
import { isValidPhoneNumber, validatePhoneNumberLength } from "libphonenumber-js";
import axios from "axios";
import { useTemplateData } from "./templates/useTemplateData";
import {
  BROWN,
  CREAM,
  FONT_IMPORT,
  FOREST,
  INPUT,
  LinedHeading,
  MUTED,
  PAGE_WRAP,
  RUST,
  SANS,
  SERIF,
  inputStyle,
} from "./templates/warmOrganic/WarmOrganicShared";
import { api } from "../../utils/axios";

// Same department ordering Nomads' own ClassicTemplateCareerPage.jsx /
// FreshStudioTemplateCareerPage.jsx use (kept slightly more complete than
// HostPanel's copy — it has a couple of Kaffe-specific departments
// HostPanel's list doesn't) so Warm Organic's grouping matches its Classic
// and Fresh Studio siblings in this repo rather than reverting to an older
// list.
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

// Warm Organic's HostPanel source (WarmOrganicTemplate.tsx) renders
// aboutTheJob/keyResponsibilities/requirements as plain whitespace-pre-wrap
// paragraphs — unlike Fresh Studio's port, it does not bullet-split them,
// does not include a softSkills block, and does not show a
// resume-fallback/"email us if unable to apply" closing block. Ported
// faithfully as-is (see WEBSITE_BUILDER_TEMPLATES_PLAN.md for the note).
const WarmOrganicTemplateCareerPage = () => {
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
    <div className={`wo-template min-h-screen ${SANS}`} style={{ backgroundColor: "#F1E6D3", color: BROWN }}>
      <style>{FONT_IMPORT}</style>
      <section className={PAGE_WRAP}>
        {!selectedJob ? (
          <>
            <LinedHeading
              title={companyName ? `Join Our Team - ${companyName}` : "Join Our Team - Company Name"}
              className="justify-center"
            />
            <div className="mx-auto max-w-2xl text-center text-[14.5px] leading-relaxed" style={{ color: MUTED }}>
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
              <div className="mt-10 flex flex-col gap-3">
                {departments.map((dept) => {
                  const isOpen = openDept === dept.department;
                  return (
                    <div key={dept.department} className="rounded-2xl p-5" style={{ backgroundColor: CREAM }}>
                      <button
                        type="button"
                        onClick={() => setOpenDept(isOpen ? "" : dept.department)}
                        className="flex w-full items-center justify-between text-left"
                      >
                        <span className={`text-[16px] font-normal ${SERIF}`}>
                          {dept.ordinal}. {dept.department}
                        </span>
                        <span style={{ color: RUST }}>{isOpen ? "−" : "+"}</span>
                      </button>
                      {isOpen ? (
                        <div className="mt-4 flex flex-col gap-2">
                          {dept.jobs.map((job, idx) => (
                            <button
                              key={job.jobCode || idx}
                              type="button"
                              onClick={() => handleSelectJob({ ...job, department: dept.department })}
                              className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-left"
                            >
                              <p className="text-[13px] font-medium">{job?.title || job?.designation || job?.name}</p>
                              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: RUST }}>
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
                  className="mt-4 self-start rounded-full px-6 py-3 text-[13px] font-semibold"
                  style={{ backgroundColor: FOREST, color: CREAM }}
                >
                  {applyBtnText === "Apply Now" ? "General application" : applyBtnText}
                </button>
                {careersClosingText || careersClosingHeading ? (
                  <div className="mt-12 text-center">
                    {careersClosingHeading ? (
                      <p className={`text-[18px] font-normal ${SERIF}`} style={{ color: BROWN }}>
                        {careersClosingHeading}
                      </p>
                    ) : null}
                    {careersClosingText ? (
                      <p className="mt-2 text-[14px] leading-relaxed" style={{ color: MUTED }}>
                        {careersClosingText}
                      </p>
                    ) : null}
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
              className="text-[12.5px] font-semibold underline underline-offset-4"
              style={{ color: FOREST }}
            >
              ← Back
            </button>
            <h2 className={`mt-4 text-[26px] font-normal ${SERIF} text-center`}>
              {isGeneral ? "General Application" : getCareersJobTitle(selectedJob)}
            </h2>
            {!isGeneral ? (
              <div className="mt-6 flex justify-center gap-6" style={{ borderBottom: `1px solid ${BROWN}22` }}>
                <button
                  type="button"
                  onClick={() => setActiveTab("description")}
                  className="pb-3 text-[12.5px] font-medium"
                  style={{
                    color: activeTab === "description" ? RUST : MUTED,
                    borderBottom: activeTab === "description" ? `2px solid ${RUST}` : "2px solid transparent",
                  }}
                >
                  Description
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("apply")}
                  className="pb-3 text-[12.5px] font-medium"
                  style={{
                    color: activeTab === "apply" ? RUST : MUTED,
                    borderBottom: activeTab === "apply" ? `2px solid ${RUST}` : "2px solid transparent",
                  }}
                >
                  Apply
                </button>
              </div>
            ) : null}
            {activeTab === "description" && !isGeneral ? (
              <div className="mt-8 flex flex-col gap-6 text-[14px] leading-relaxed" style={{ color: MUTED }}>
                {selectedJob?.aboutTheJob ? (
                  <div>
                    <p className="font-medium" style={{ color: BROWN }}>
                      About this role
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">{selectedJob.aboutTheJob}</p>
                  </div>
                ) : null}
                {selectedJob?.keyResponsibilities ? (
                  <div>
                    <p className="font-medium" style={{ color: BROWN }}>
                      Key responsibilities
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">{selectedJob.keyResponsibilities}</p>
                  </div>
                ) : null}
                {selectedJob?.requirements ? (
                  <div>
                    <p className="font-medium" style={{ color: BROWN }}>
                      Requirements
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">{selectedJob.requirements}</p>
                  </div>
                ) : null}
              </div>
            ) : null}
            {activeTab === "apply" || isGeneral ? (
              <div className="mt-8">
                {submitSuccess ? (
                  <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: CREAM }}>
                    <p className="text-[14px] font-medium">Application submitted!</p>
                    <p className="mt-1 text-[13px]" style={{ color: MUTED }}>
                      We'll review it and get back to you shortly.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-3 rounded-2xl p-6 md:grid-cols-2"
                    style={{ backgroundColor: CREAM }}
                  >
                    <input
                      type="text"
                      required
                      placeholder="Full name *"
                      value={form.fullName}
                      onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                      className={INPUT}
                      style={inputStyle}
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email *"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      className={INPUT}
                      style={inputStyle}
                    />
                    <input
                      type="date"
                      required
                      value={form.dateOfBirth}
                      onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                      className={INPUT}
                      style={inputStyle}
                    />
                    <select
                      required
                      value={form.country}
                      onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                      className={INPUT}
                      style={inputStyle}
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
                      style={inputStyle}
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
                      style={inputStyle}
                    >
                      <option value="">City *</option>
                      {applyCityList.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-stretch rounded-xl bg-white" style={inputStyle}>
                      <span
                        className="flex shrink-0 items-center rounded-l-xl px-3 text-[13px]"
                        style={{ borderRight: `1px solid ${BROWN}33`, color: MUTED }}
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
                        className="w-full rounded-r-xl px-3 py-2.5 text-[14px] outline-none"
                      />
                    </div>
                    <label
                      className="flex cursor-pointer items-center justify-between rounded-xl bg-white px-3 py-2.5 text-[13px]"
                      style={{ border: `1px solid ${BROWN}44` }}
                    >
                      <span>{resumeFile ? resumeFile.name : "Upload resume / CV *"}</span>
                      <span className="rounded-lg px-2 py-1 text-[10px] uppercase tracking-wider" style={{ border: `1px solid ${BROWN}33` }}>
                        Choose file
                      </span>
                      <input
                        type="file"
                        required
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                      />
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
                          style={inputStyle}
                        />
                      ) : field.type === "select" ? (
                        <select
                          key={field.id}
                          required={field.required}
                          value={customValues[field.id] || ""}
                          onChange={(e) => setCustomValues((p) => ({ ...p, [field.id]: e.target.value }))}
                          className={field.fullWidth ? `md:col-span-2 ${INPUT}` : INPUT}
                          style={inputStyle}
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
                          style={inputStyle}
                        />
                      ),
                    )}
                    {submitError ? <p className="md:col-span-2 text-[12px] text-red-600">{submitError}</p> : null}
                    <button
                      type="submit"
                      disabled={submitPending}
                      className="md:col-span-2 rounded-full py-3 text-[13px] mt-5 font-semibold disabled:opacity-50"
                      style={{ backgroundColor: FOREST, color: CREAM }}
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

export default WarmOrganicTemplateCareerPage;
