import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Country, State, City } from "country-state-city";
import { validatePhoneNumberLength, isValidPhoneNumber } from "libphonenumber-js";
import { FiChevronDown } from "react-icons/fi";
import axios from "axios";
import { api } from "../../utils/axios";
import LinedHeading from "./components/LinedHeading";

const CAREERS_DEFAULT_DEPARTMENT_ORDER = [
  "Product & Tech Development", "Tech", "Technology",
  "Networking & IT", "IT",
  "Finance",
  "Human Resource & EA", "HR", "Human Resources",
  "Sales & Business Development", "Sales",
  "Administration & Front office", "Administration",
  "Marketing",
  "Legal",
  "Kaffe Operation", "Kaffe Kitchen",
  "Internships Across Departments",
  "Civil & Maintenance", "Service & Maintenance", "Maintenance",
];

const CAREERS_ROMAN = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII"];

const CAREERS_FALLBACK_INTRO = [
  "Join our team if you want to help shape a platform that blends operations, service, and technology into one experience.",
];

const CAREERS_FALLBACK_CLOSE = [
  "Please send in your resume here on Apply Now if you cannot find your department of interest.",
  "*Mention your applying department in the message box",
];

const getCareersJobTitle = (job) =>
  String(job?.title || job?.designation || job?.name || "Untitled Role").trim();

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
  ].map((v) => String(v || "").trim()).filter(Boolean).map((v) => v.replace(/_/g, " "));
  return meta.length ? meta.join(" | ") : "Apply now to view the full role details.";
};

const parseCareersFormFields = (value) => {
  try {
    const raw = typeof value === "string" ? JSON.parse(value || "[]") : value;
    if (!Array.isArray(raw)) return [];
    return raw.map((field, index) => ({
      id: String(field?.id || `field_${index}`),
      type: ["text", "textarea", "select", "number", "email", "tel"].includes(String(field?.type || "text"))
        ? String(field?.type || "text")
        : "text",
      label: String(field?.label || "").trim(),
      required: field?.required === true,
      options: String(field?.options || ""),
      fullWidth: field?.fullWidth === true,
    })).filter((field) => field.label || field.id);
  } catch {
    return [];
  }
};

const FIELD_CLASS = "w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] outline-none focus:border-[#111827]";
const SELECT_CLASS = "w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] outline-none focus:border-[#111827] appearance-auto";

const TemplateCareerPage = () => {
  const { data, isPending, error } = useOutletContext();
  const navigate = useNavigate();
  const { jobCode } = useParams();
  const companyName = data?.companyName || "";
  const workspaceId = data?.workspaceId || "";
  const companyLogo = data?.companyLogoUrl || "";
  const email = data?.websiteEmail || data?.email || "";
  const careersFormFields = useMemo(
    () => parseCareersFormFields(data?.careersFormFields),
    [data?.careersFormFields],
  );

  const [selectedJob, setSelectedJob] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [openDept, setOpenDept] = useState("");
  const [form, setForm] = useState({
    fullName: "", email: "", dateOfBirth: "", phone: "",
    country: "", state: "", city: "",
  });
  const [customValues, setCustomValues] = useState({});
  const [resumeFile, setResumeFile] = useState(null);
  const [submitPending, setSubmitPending] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [applyCountryList] = useState(() => Country.getAllCountries());
  const [applyStateList, setApplyStateList] = useState([]);
  const [applyCityList, setApplyCityList] = useState([]);

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

  useEffect(() => {
    if (jobCode && jobs.length > 0) {
      const found = jobs.find((j) => j.jobCode === jobCode) || null;
      setSelectedJob(found);
      setActiveTab("description");
      if (found?.department) setOpenDept(found.department);
    } else if (!jobCode) {
      setSelectedJob(null);
    }
  }, [jobCode, jobs]);

  useEffect(() => {
    if (!form.country) { setApplyStateList([]); setApplyCityList([]); return; }
    setApplyStateList(State.getStatesOfCountry(form.country));
    setApplyCityList([]);
    setForm((p) => ({ ...p, state: "", city: "" }));
  }, [form.country]);

  useEffect(() => {
    if (!form.country || !form.state) { setApplyCityList([]); return; }
    setApplyCityList(City.getCitiesOfState(form.country, form.state));
    setForm((p) => ({ ...p, city: "" }));
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
      ...Array.from(grouped.keys())
        .filter((d) => !CAREERS_DEFAULT_DEPARTMENT_ORDER.includes(d))
        .sort(),
    ].filter((d, i, arr) => arr.indexOf(d) === i && grouped.has(d));
    return ordered.map((dept, i) => ({
      department: dept,
      ordinal: CAREERS_ROMAN[i] || String(i + 1),
      jobs: grouped.get(dept),
    }));
  }, [jobs]);

  const resetForm = () => {
    setForm({ fullName: "", email: "", dateOfBirth: "", phone: "", country: "", state: "", city: "" });
    setCustomValues({});
    setResumeFile(null);
    setSubmitSuccess(false);
    setSubmitError("");
  };

  const handleSelectJob = (job) => {
    setOpenDept(job.department || "");
    resetForm();
    navigate(`/careers/${encodeURIComponent(job.jobCode || "")}`, {
      state: { jobTitle: getCareersJobTitle(job) },
      replace: false,
    });
  };

  const handleGeneralApply = () => {
    resetForm();
    setActiveTab("apply");
    setSelectedJob({ jobTitle: "General Application", jobCode: "GENERAL" });
    navigate("/careers/GENERAL", {
      state: { jobTitle: "General Application" },
      replace: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    const phoneDigits = form.phone.replace(/\D/g, "");
    if (form.country && !isValidPhoneNumber(phoneDigits, form.country)) {
      setSubmitError(
        `Please enter a valid mobile number for the selected country (${applyDialCode}).`,
      );
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
      fd.append(
        "phone",
        applyDialCode && form.phone ? `${applyDialCode} ${form.phone.trim()}` : form.phone,
      );
      fd.append("country", form.country);
      fd.append("state", form.state);
      fd.append("city", form.city);
      fd.append("customFields", JSON.stringify(customValues));
      if (resumeFile) fd.append("resumeFile", resumeFile);

      await axios.post(
        "https://wonomasterbe.vercel.app/api/recruitment/jobs/apply",
        fd,
      );

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        resetForm();
        navigate("/careers", { replace: false });
      }, 3000);
    } catch (err) {
      setSubmitError(err?.response?.data?.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitPending(false);
    }
  };

  if (isPending) return null;
  if (error) return <div>Error loading careers page.</div>;
  if (!data) return <div>Site data is currently unavailable</div>;

  const careersPageIntro = String(data?.careersPageIntro || "").trim();
  const careersClosingText = String(data?.careersClosingText || "").trim();
  const careersClosingHeading = String(data?.careersClosingHeading || "").trim();
  const applyBtnText = String(data?.careersApplyButtonText || "").trim() || "Apply Now";

  const introParagraphs = careersPageIntro
    ? careersPageIntro.split("\n").filter(Boolean)
    : CAREERS_FALLBACK_INTRO;

  const CAREERS_PAGE_HEADING = companyName ? `Join Our Team - ${companyName}` : "Join Our Team";

  const renderFormFields = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <input
        type="text" required placeholder="Name *" value={form.fullName}
        onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
        className={FIELD_CLASS}
      />
      <input
        type="email" required placeholder="Email *" value={form.email}
        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        className={FIELD_CLASS}
      />
      <input
        type="text" required placeholder="Date of Birth (DOB) *" value={form.dateOfBirth}
        onFocus={(e) => { e.target.type = "date"; }}
        onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
        onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
        className={FIELD_CLASS}
      />
      <select
        required value={form.country}
        onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
        className={SELECT_CLASS}
        style={{ border: "1px solid #cbd5e1", backgroundColor: "#fff" }}
      >
        <option value="">Country *</option>
        {applyCountryList.map((c) => (
          <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
        ))}
      </select>
      <select
        required value={form.state}
        onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
        disabled={!form.country}
        className={SELECT_CLASS}
        style={{ border: "1px solid #cbd5e1", backgroundColor: "#fff" }}
      >
        <option value="">State *</option>
        {applyStateList.map((s) => (
          <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
        ))}
      </select>
      <select
        required value={form.city}
        onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
        disabled={!form.state}
        className={SELECT_CLASS}
        style={{ border: "1px solid #cbd5e1", backgroundColor: "#fff" }}
      >
        <option value="">City *</option>
        {applyCityList.map((c) => (
          <option key={c.name} value={c.name}>{c.name}</option>
        ))}
      </select>
      <div className="flex gap-2">
        <span
          className={`flex shrink-0 items-center rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-[13px] ${
            applyDialCode ? "text-[#111827]" : "text-[#9ca3af]"
          }`}
          title={applyDialCode ? "" : "Select country for code"}
        >
          {applyDialCode || "+ --"}
        </span>
        <input
          type="tel" required placeholder="Mobile Number *" value={form.phone}
          onChange={(e) => {
            const cleaned = e.target.value.replace(/[^\d\s-]/g, "");
            const digits = cleaned.replace(/\D/g, "");
            if (
              form.country && digits &&
              validatePhoneNumberLength(digits, form.country) === "TOO_LONG"
            ) return;
            setForm((p) => ({ ...p, phone: cleaned }));
          }}
          className={FIELD_CLASS}
        />
      </div>
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-[11px] sm:text-[13px]">
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span className="min-w-0 flex-1 truncate font-medium leading-tight text-[#111827]">
            {resumeFile ? resumeFile.name : "Upload Resume / CV *"}
          </span>
          <span className="shrink-0 rounded-md border border-slate-300 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#374151] sm:px-3 sm:text-[11px]">
            Choose File
          </span>
          <input
            type="file" required accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
          />
        </label>
      </div>
      {careersFormFields.map((field) => {
        const val = customValues[field.id] || "";
        const fieldClass = `${field.fullWidth ? "md:col-span-2" : ""} ${FIELD_CLASS}`;
        const placeholder = `${field.label}${field.required ? " *" : ""}`;

        if (field.type === "textarea") {
          return (
            <textarea
              key={field.id} rows={3} required={field.required}
              placeholder={placeholder} value={val}
              onChange={(e) => setCustomValues((p) => ({ ...p, [field.id]: e.target.value }))}
              className={`md:col-span-2 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-[13px] outline-none focus:border-[#111827]`}
            />
          );
        }
        if (field.type === "select") {
          const options = String(field.options || "").split(",").map((o) => o.trim()).filter(Boolean);
          return (
            <select
              key={field.id} required={field.required} value={val}
              onChange={(e) => setCustomValues((p) => ({ ...p, [field.id]: e.target.value }))}
              className={`${fieldClass} appearance-auto`}
              style={{ border: "1px solid #cbd5e1", backgroundColor: "#fff" }}
            >
              <option value="">{placeholder}</option>
              {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          );
        }
        return (
          <input
            key={field.id} type={field.type} required={field.required}
            placeholder={placeholder} value={val}
            onChange={(e) => setCustomValues((p) => ({ ...p, [field.id]: e.target.value }))}
            className={fieldClass}
          />
        );
      })}
    </div>
  );

  /* ---- Job Detail View ---- */
  if (selectedJob) {
    const jobTitle = getCareersJobTitle(selectedJob);
    const showGeneral = selectedJob.jobCode === "GENERAL";

    return (
      <section className="bg-[#efefef] px-4 py-10 md:px-6">
        <div className="mx-auto mt-6 w-full max-w-7xl">
          <LinedHeading title={showGeneral ? "Untitled Role" : jobTitle} />

          {!showGeneral ? (
            <div className="mt-8 flex border-b-2 border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab("description")}
                className={`flex-1 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] border-b-2 transition ${
                  activeTab === "description"
                    ? "border-[#111827] text-[#111827]"
                    : "border-transparent text-[#6b7280] hover:text-[#111827]"
                }`}
              >
                Job Description
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("apply")}
                className={`flex-1 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] border-b-2 transition ${
                  activeTab === "apply"
                    ? "border-[#111827] text-[#111827]"
                    : "border-transparent text-[#6b7280] hover:text-[#111827]"
                }`}
              >
                Apply Now
              </button>
            </div>
          ) : (
            <div className="mt-8 flex border-b-2 border-slate-200">
              <div className="flex-1 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] border-b-2 border-[#111827] text-[#111827] text-center">
                Apply Now
              </div>
            </div>
          )}

          {!showGeneral && activeTab === "description" ? (
            <div className="mt-6 space-y-7 text-[14px] leading-7 text-[#374151]">
              {selectedJob.aboutTheJob ? (
                <div>
                  <p className="text-[18px] font-bold text-[#111827]">About this role</p>
                  <p className="mt-2 whitespace-pre-wrap">{selectedJob.aboutTheJob}</p>
                </div>
              ) : null}
              {selectedJob.keyResponsibilities ? (
                <div>
                  <p className="text-[18px] font-bold text-[#111827]">Key responsibilities</p>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    {selectedJob.keyResponsibilities.split(/\.\s+/).filter(Boolean).map((item, i) => (
                      <li key={`resp-${i}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {selectedJob.requirements ? (
                <div>
                  <p className="text-[18px] font-bold text-[#111827]">Requirements</p>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    {selectedJob.requirements.split(/\.\s+/).filter(Boolean).map((item, i) => (
                      <li key={`req-${i}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {selectedJob.softSkills ? (
                <div>
                  <p className="text-[18px] font-bold text-[#111827]">Soft skills</p>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    {selectedJob.softSkills.split(/\.\s+/).filter(Boolean).map((item, i) => (
                      <li key={`skill-${i}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="border-t border-slate-200 pt-6 text-center">
                {companyLogo ? (
                  <img src={companyLogo} alt={companyName} className="mx-auto h-12 object-contain" />
                ) : companyName ? (
                  <p className="text-[16px] font-semibold text-[#111827]">{companyName}</p>
                ) : null}
                {email ? (
                  <p className="mt-3 text-[14px] leading-7 text-[#374151]">
                    Please send in your resume to{" "}
                    <span className="font-semibold text-[#111827]">Email: {email}</span>{" "}
                    if unable to apply now.
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
              {submitSuccess ? (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">✓</div>
                  <p className="mt-3 text-[14px] font-semibold text-green-700">Application Submitted!</p>
                  <p className="mt-2 text-[12px] leading-6 text-green-700">We will review your application and get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <p className="mb-6 text-center text-[25px] font-bold uppercase tracking-[0.10em] text-[#111827]">
                    Application Form
                  </p>
                  {renderFormFields()}
                  {submitError ? <p className="mt-4 text-[12px] text-red-500">{submitError}</p> : null}
                  <div className="mt-6 flex justify-center">
                    <button
                      type="submit" disabled={submitPending}
                      className="rounded-full bg-[#111827] px-8 py-3 text-[13px] font-semibold text-white transition hover:bg-[#1f2937] disabled:opacity-60"
                    >
                      {submitPending ? "Submitting..." : "Submit Application"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  /* ---- Main Listings View ---- */
  return (
    <section className="bg-[#efefef] px-4 py-10 md:px-6">
      <div className="mx-auto mt-6 w-full max-w-7xl">
        <LinedHeading
          title={CAREERS_PAGE_HEADING}
          titleClassName="max-w-[72vw] text-[clamp(0.72rem,4vw,26px)] leading-tight tracking-[0.08em] sm:max-w-none sm:text-base sm:tracking-[0.15em]"
        />

        <div className="mx-auto mt-10 max-w-4xl text-center text-[15px] leading-[1.9] text-[#374151] font-['Poppins',ui-sans-serif,system-ui,sans-serif] md:text-[17px]">
          {introParagraphs.map((para, i) => (
            <p key={`intro-${i}`} className="mb-5 last:mb-0">{para}</p>
          ))}
        </div>

        <div className="mt-10 flex items-center gap-4">
          <div className="flex-1 border-t border-[#111827]" />
          <h2 className="shrink-0 text-center text-[20px] font-semibold uppercase tracking-[0.15em] text-[#111827] md:text-[28px] lg:text-[26px]">
            Open Positions
          </h2>
          <div className="flex-1 border-t border-[#111827]" />
        </div>

        {jobsLoading ? (
          <div className="mt-10 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#111827]" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="mt-10 rounded-[28px] px-6 py-10 text-center ">
            <p className="text-[16px] font-semibold text-[#111827]">No job openings at the moment.</p>
            <p className="mt-2 text-[14px] text-[#374151]">Please check back later or use the apply button to share your resume.</p>
          </div>
        ) : (
          <div className="mt-5 space-y-2">
            {departments.map((section) => {
              const isOpen = openDept === section.department;
              return (
                <div key={section.department} className="border-b border-slate-200">
                  <button
                    type="button"
                    onClick={() => setOpenDept(isOpen ? "" : section.department)}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left transition"
                  >
                    <span className="text-[16px] font-bold text-[#111827] md:text-[19px]">
                      {section.ordinal}. {section.department}
                      {section.department.toLowerCase().includes("team") ? "" : " Team"}
                    </span>
                    <span className={`text-[#6b7280] transition-transform ${isOpen ? "rotate-180" : ""}`}>
                      <FiChevronDown size={18} />
                    </span>
                  </button>
                  {isOpen ? (
                    <div className="border-t border-slate-200 py-2 pl-3 md:pl-4">
                      {section.jobs.map((job, jobIndex) => {
                        const jobTitle = getCareersJobTitle(job);
                        const jobMeta = getCareersJobMeta(job);
                        return (
                          <button
                            key={job.jobCode || job.id || `${section.department}-${jobTitle}-${jobIndex}`}
                            type="button"
                            onClick={() => handleSelectJob({ ...job, department: section.department })}
                            className="flex w-full items-center justify-between gap-4 border-b border-slate-100 py-3 text-left last:border-b-0"
                          >
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-[#374151] md:text-[14px]">
                                {jobIndex + 1}. {jobTitle}
                              </p>
                              <p className="mt-1 text-[12px] font-medium leading-6 text-[#6b7280]">{jobMeta}</p>
                            </div>
                            <span className="shrink-0 rounded-md bg-[#111827] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                              {applyBtnText}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 border-t border-slate-200 pt-8 flex flex-col items-center text-center">
          {companyLogo ? (
            <img src={companyLogo} alt={companyName} className="mx-auto h-12 object-contain" />
          ) : companyName ? (
            <p className="text-[16px] font-semibold text-[#111827]">{companyName}</p>
          ) : null}
          <p className="mt-4 max-w-lg text-[14px] leading-7 text-[#374151]">
            {careersClosingText || CAREERS_FALLBACK_CLOSE[0]}
          </p>
          <p className="mt-1 text-[12px] text-[#6b7280]">
            {careersClosingHeading || CAREERS_FALLBACK_CLOSE[1]}
          </p>
          <button
            type="button"
            onClick={handleGeneralApply}
            className="mt-5 rounded-full bg-[#111827] px-8 py-3 text-[13px] font-semibold text-white transition hover:bg-[#1f2937]"
          >
            Apply Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default TemplateCareerPage;
