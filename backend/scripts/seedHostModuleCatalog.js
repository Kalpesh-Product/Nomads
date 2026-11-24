// One-time/rerunnable seed: upserts the host.wono.co /modules catalog into
// Mongo (HostModuleCategory) from the structure that used to live only in
// frontend/src/data/hostModulesCatalog.js, uploading each mock screenshot
// that still sits in frontend/src/assets/host-panel-mock(-v2)/ to S3 so the
// catalog starts with real, working image URLs instead of empty ones.
// Rerunning replaces each category wholesale — safe to run again after
// editing the structure below, but any edits already made through the
// master panel's admin API will be overwritten.
import mongoose from "mongoose";
import { config } from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import HostModuleCategory from "../models/HostModuleCategory.js";
import { uploadFileToS3 } from "../config/s3Config.js";

config({ override: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_V1 = path.resolve(__dirname, "../../frontend/src/assets/host-panel-mock");
const ASSETS_V2 = path.resolve(__dirname, "../../frontend/src/assets/host-panel-mock-v2");

const MIME_BY_EXT = { ".png": "image/png", ".gif": "image/gif", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };

const img = (dir, filename) => ({ dir, filename });
const v1 = (filename) => img(ASSETS_V1, filename);
const v2 = (filename) => img(ASSETS_V2, filename);

// --- category/module structure, 1:1 with the old hostModulesCatalog.js ----

const CATEGORIES = [
  {
    id: "common-modules",
    label: "Common Modules",
    order: 0,
    modules: [
      { id: "dashboard", label: "Dashboard", iconKey: "HiOutlineViewGrid", plan: "basic",
        summary: "The main page after logging in — a consolidated view of activity across every enabled module without opening each one individually.",
        bullets: [
          "Review attendance, tenants, bookings, tickets, visitors, leads, leave activity and department metrics from one screen",
          "Business-unit selector to switch the location being reviewed",
          "Quick links and recent-activity cards open the related operational module",
        ], image: v2("dashboard.png") },
      { id: "customer-support", label: "Customer Support", iconKey: "MdOutlineSupportAgent", plan: "basic",
        summary: "Raise support issues directly to the WONO team, track progress, and review resolutions.",
        bullets: [
          "Review open and resolved WONO support tickets with status filters and search",
          "Raise an issue with a title, description, affected page and attachments",
          "Submit immediately or save as a draft",
        ], image: v2("customer-support.png") },
      { id: "tickets", label: "Tickets", iconKey: "HiOutlineClipboardList", plan: "professional",
        summary: "Internal ticketing — report issues and route them to the responsible department for resolution.",
        bullets: [
          "Separate Company, Tenant Company, My Assigned and My Raised views",
          "Filter by status or department, search by ticket information",
          "Raise a ticket using an existing or custom issue type; export ticket data",
        ], image: v2("tickets.png") },
      { id: "meeting-room-booking", label: "Meeting Room Booking", iconKey: "MdMeetingRoom", plan: "professional",
        summary: "Reserve meeting rooms, manage bookings for members, external visitors and tenant companies.",
        bullets: [
          "Personal, internal, external and tenant-company reservations",
          "Live availability check by room, date and time",
          "View, reschedule or cancel eligible bookings; export booking data",
        ], image: v2("meeting-room-booking.png") },
      { id: "calendar", label: "Calendar", iconKey: "HiOutlineCalendar", plan: "professional",
        summary: "A unified monthly view of activity scheduled across the workspace — bookings and tickets in one place.",
        bullets: [
          "Move between months, jump back to Today, select a date to view its events",
          "Open an event to review the related information",
          "Search or filter by event type (record creation stays in the source module)",
        ], image: v2("calendar.png") },
      { id: "printouts", label: "Printouts", iconKey: "HiOutlineDocumentText", plan: "professional",
        summary: "Send documents to the front desk for printing and track each request.",
        bullets: [
          "Create a request with copies, priority, color, paper size and documents",
          "View or edit a pending request, cancel where allowed",
          "Track Pending, In Progress, Completed, Rejected or Cancelled",
        ], image: v2("printouts.png") },
      { id: "attendance", label: "Attendance", iconKey: "MdOutlineFingerprint", plan: "custom",
        summary: "Record daily attendance, track working hours and breaks, and manage correction requests.",
        bullets: [
          "My Attendance: clock in/out with selfie + location verification",
          "Team Attendance where role access permits",
          "Corrections: request or review attendance corrections",
        ], image: v2("attendance.png") },
      { id: "tasks", label: "Tasks", iconKey: "HiOutlineClipboardCheck", plan: "custom",
        summary: "Create, assign, monitor and track work across the organization.",
        bullets: [
          "Switch between company tasks and tasks assigned to you",
          "Search, filter by status or department, review priority and due dates",
          "Assign to yourself or a department with instructions and reference files",
        ], image: v2("tasks.png") },
      { id: "leave-requests", label: "Leave Requests", iconKey: "HiOutlineLogout", plan: "custom",
        summary: "Apply for leave, track personal requests, and handle approvals based on role.",
        bullets: [
          "My Leaves: review balances, submit leave, track personal requests",
          "Full Day, Half Day or Partial leave with calculated deduction preview",
          "Company Leaves for org-wide visibility; Leave Requests queue for approvers",
        ], image: v2("leave-requests.png") },
    ],
  },
  {
    id: "extra-common-modules",
    label: "Extra Common Modules",
    order: 1,
    modules: [
      { id: "assets", label: "Assets", iconKey: "HiOutlineCollection", plan: "custom",
        summary: "A central record of company assets — location, owning department, assignment, and status.",
        bullets: [
          "Add, edit or transfer assets; raise asset-related issues",
          "Review quantities, warranty and ownership information",
          "Department asset requests, plus export",
        ], image: v2("assets.png") },
      { id: "inventory", label: "Inventory", iconKey: "HiOutlineCollection", plan: "custom",
        summary: "Manage consumable and returnable stock across the organization.",
        bullets: [
          "Track stock by item, category and owning department",
          "Increase for purchases, decrease for consumption, transfer between departments",
          "Monthly stock balances, ledger activity, export",
        ], image: v2("inventory.png") },
      { id: "finance-management", label: "Finance Management", iconKey: "HiOutlineCash", plan: "custom",
        summary: "A centralized view of company budgets, spending, and financial activity across departments.",
        bullets: [
          "Executive Finance Hub: budget, year-to-date spend, finance requests",
          "Approval Center: projected annual budget + extra budget requests",
          "Master Overview compares approved budget, spend and balance by department",
        ], image: v2("finance-management.png") },
      { id: "team-management", label: "Team Management", iconKey: "HiOutlineUserGroup", plan: "custom",
        summary: "A central place to review team members, manage access, and view department SOPs/policies.",
        bullets: [
          "Team roster and employee status in Access Control",
          "Search or filter team members by status",
          "View department SOPs and policies available to the manager",
        ], image: v2("team-management.png") },
      { id: "reports", label: "Reports", iconKey: "HiOutlineDocumentText", plan: "custom",
        summary: "A central archive for viewing, filtering, previewing and downloading structured reports.",
        bullets: [
          "Filter by category, department, month or reporting window",
          "Preview or download available reports",
          "Export in PDF or Excel",
        ], image: v2("reports.png") },
    ],
  },
  {
    id: "key-apps",
    label: "Key Apps",
    order: 2,
    modules: [
      { id: "website-builder", label: "Website Builder", iconKey: "HiOutlineGlobeAlt", plan: "basic",
        summary: "Create and manage the business website — plus website enquiries, reviews and career applications from the same hub.",
        image: v2("website-builder.png"),
        children: [
          { id: "create-edit-website", label: "Create / Edit Website", iconKey: "HiOutlinePencilAlt",
            summary: "Choose a template, configure every page, preview, then publish using website credits.",
            bullets: [
              "Configure Home, About, Services, Gallery, Partner, Careers and Contact content",
              "Preview the site before publishing; use the published URL after release",
              "Edit the website or change template later",
            ], image: v1("create-edit-website.png") },
          { id: "website-leads-page", label: "Website Leads", iconKey: "HiOutlineMailOpen",
            summary: "Enquiries submitted through forms on the published website.",
            bullets: [
              "Total / Pending / Closed summary cards",
              "Website-sourced only — All Leads combines this with Nomad enquiries",
            ], image: v1("website-leads.gif") },
          { id: "website-review-page", label: "Website Review", iconKey: "HiOutlineStar",
            summary: "Visitor-submitted website reviews, moderated by the host.",
            bullets: [
              "Approve feedback that can be shown publicly, reject spam or abuse",
              "Separate from Nomad Listing reviews",
            ], image: v1("website-review.gif") },
          { id: "careers-page", label: "Careers", iconKey: "HiOutlineBriefcase",
            summary: "Publish job openings on the website and manage applications. Locked until a website exists.",
            bullets: [
              "Job Openings tab: vacancies, status, Publish Job",
              "Applications: Screening → Interview Scheduled → Interviewed → Selected",
            ], image: v1("careers.gif") },
        ] },
      { id: "nomad-listings", label: "Nomad Listings", iconKey: "HiOutlineMap", plan: "basic",
        summary: "Manage the business listings displayed through the WONO Nomads platform.",
        image: v2("nomad-listings.png"),
        children: [
          { id: "listings", label: "Listings", iconKey: "HiOutlineCollection",
            summary: "Create and manage business listings shown through WONO Nomads.",
            bullets: [
              "Search and filter listings, then view or edit details",
              "Add listing images, business information and supported content",
            ], image: v1("nomad-listings.gif") },
          { id: "nomad-reviews", label: "Reviews", iconKey: "HiOutlineStar",
            summary: "Manage listing reviews and their public display.",
            bullets: ["Filter by status, rating, product type, and listing"], image: v1("nomad-reviews.gif") },
          { id: "nomad-leads", label: "Leads", iconKey: "HiOutlineMailOpen",
            summary: "Enquiries submitted from Nomad listings.",
            bullets: [
              "Total / Pending / Closed summary",
              "Source-specific — All Leads combines this with website enquiries",
            ], image: v1("nomad-leads.gif") },
          { id: "verify-business", label: "Verify Business", iconKey: "HiOutlineBadgeCheck",
            summary: "Manages the blue verified badge for active public Nomad listings.",
            bullets: [
              "Unlocks once the company has an active public listing",
              "Listings, Status, and Payment History tabs",
            ], image: v1("verify-business.png") },
        ] },
      { id: "all-leads", label: "All Leads", iconKey: "HiOutlineMailOpen", plan: "basic",
        summary: "A combined view of leads received through the business's Website and Nomad Listings.",
        bullets: [
          "Filter by status and search for specific enquiries",
          "Review source and lead information from the combined list",
          "Use the source-specific modules when deeper action is required",
        ], image: v2("all-leads.png") },
      { id: "visitor-management", label: "Visitor Management", iconKey: "HiOutlineIdentification", plan: "basic",
        summary: "Register visitors, check them in/out, manage walk-ins, history and reusable client records.",
        image: v2("visitor-management.png"),
        children: [
          { id: "daily-visitors", label: "Daily Visitors", iconKey: "HiOutlineClock",
            summary: "Operational view of today's visitor activity.",
            bullets: ["Check visitors in, print passes, check them out"], image: v1("daily-visitors.png") },
          { id: "visitor-history", label: "Visitor History", iconKey: "HiOutlineClipboardList",
            summary: "Past visitor records, bookings and reusable client information.",
            bullets: ["Review visitor history and booking records"], image: v1("visitor-history.png") },
          { id: "standard-visitor", label: "Standard Visitor (Front Desk)", iconKey: "HiOutlineIdentification",
            summary: "Register standard visitors; advanced flows (Unit Tour, Walk-In Booking, Verify Booking) where available.",
            bullets: ["New Visitor or Existing Visitor lookup", "Check-in generates a printable badge"], image: v1("standard-visitor.png") },
        ] },
    ],
  },
  {
    id: "core-modules",
    label: "Core Modules",
    order: 3,
    modules: [
      { id: "organization-management", label: "Organization Management", iconKey: "HiOutlineOfficeBuilding", plan: "basic",
        summary: "The Founder manages platform users, departments, department managers, employees and org-level access.",
        bullets: [
          "Add users, review invitations, manage permitted user access",
          "View departments, members and managers",
          "Change department managers, add employees, create custom departments",
        ], image: v2("organization-management.png") },
      { id: "access-grants", label: "Access Grants", iconKey: "HiOutlineKey", plan: "basic",
        summary: "Review workspace members, their roles, and their access to modules available under the plan.",
        bullets: [
          "Filter users by role or access state; inspect member access records",
          "Grant or remove module access where permitted",
          "Protected-role behaviour and ownership-transfer controls for Founder access",
        ], image: v2("access-grants.png") },
      { id: "analytics", label: "Analytics", iconKey: "HiOutlineChartBar", plan: "basic",
        summary: "A consolidated view of activity across every module enabled for the unit.",
        bullets: [
          "Platform totals, open items, activity scores and monthly trends",
          "Module-wise analytics for Common, Extra Common, Key Apps and Core Modules",
          "Department analytics across HR, Administration, Sales, Finance, Maintenance, Tech and IT",
        ], image: v2("analytics.png") },
      { id: "unit-settings", label: "Unit Settings", iconKey: "HiOutlineAdjustments", plan: "basic",
        summary: "The Founder manages business units linked to the account and configures settings per location.",
        bullets: [
          "View linked business units; create another unit and switch the active one",
          "Configure location, attendance, working hours and other workspace options",
        ], image: v2("unit-settings.png") },
      { id: "unit-management", label: "Unit Management", iconKey: "HiOutlineOfficeBuilding", plan: "basic",
        summary: "The Founder reviews and compares operational activity across linked business units.",
        bullets: [
          "Compare employees, tickets, bookings and other data across units",
          "Open detailed information for an individual unit, or switch into it",
        ], image: v2("unit-management.png") },
    ],
  },
  {
    id: "department-accesses",
    label: "Department Accesses",
    order: 4,
    modules: [
      { id: "sales-department", label: "Sales Department", iconKey: "HiOutlineTrendingUp", plan: "professional",
        summary: "Leads, tenant companies, virtual offices, resource pricing, and the workspace's sales architecture.",
        image: v2("sales-leads-management.png"),
        children: [
          { id: "sales-leads-management", label: "Leads Management", iconKey: "HiOutlineMailOpen",
            summary: "Review incoming leads, track progress, update sales stage, convert into tenant opportunities.",
            bullets: [
              "All Website & Nomad Leads",
              "Unit Tour Leads, tracked through New → Contacted → Qualified → Converted / Lost",
            ], image: v2("sales-leads-management.png") },
          { id: "sales-tenant-companies", label: "Tenant Companies", iconKey: "HiOutlineOfficeBuilding",
            summary: "Onboard and manage companies occupying workspace resources — contracts, allocation, billing.",
            bullets: ["Tenant Companies list", "Extra Credits Requests"], image: v2("sales-tenant-companies.png") },
          { id: "sales-virtual-offices", label: "Virtual Offices", iconKey: "HiOutlineGlobeAlt",
            summary: "Onboard and manage companies using Virtual Office services.",
            bullets: ["Virtual Office Companies: rental plans, contracts, space allocation", "Rent Collections & Payments"], image: v2("sales-virtual-offices.png") },
          { id: "sales-resource-pricing", label: "Resource & Pricing", iconKey: "HiOutlineCreditCard",
            summary: "Configure the resources that can be booked or assigned to tenant companies.",
            bullets: ["Resources: rooms, desks, pricing, credits, availability", "Tenant Packages"], image: v2("sales-resource-pricing.png") },
          { id: "sales-architecture", label: "Sales Architecture", iconKey: "HiOutlineMap",
            summary: "A visual view of how workspace resources are distributed across the location.",
            bullets: ["View/manage space for Tenant Companies, Virtual Offices, Internal Departments"], image: v2("sales-architecture.png") },
        ] },
      { id: "finance-department", label: "Finance Department", iconKey: "HiOutlineCurrencyDollar", plan: "custom",
        summary: "Budgets, billing & payments, and full accounting for the workspace.",
        image: v2("finance-expenses-budget.png"),
        children: [
          { id: "finance-expenses-budget", label: "Expenses & Budget", iconKey: "HiOutlineCash",
            summary: "Budget planning, approval tracking, extra budget requests, and expense records.",
            bullets: ["Projected Annual Budget", "Extra Budget Requests"], image: v2("finance-expenses-budget.png") },
          { id: "finance-billing-payments", label: "Billing & Payments", iconKey: "HiOutlineCreditCard",
            summary: "Billing, invoices, deposits, revenue collections, payroll payments, and transaction records.",
            bullets: ["Tenant Security Deposits", "Tenant Rent billing and payment records"], image: v2("finance-billing-payments.png") },
          { id: "finance-accounting", label: "Accounting", iconKey: "HiOutlineChartBar",
            summary: "Financial transactions, departmental financial info, and P&L reporting.",
            bullets: ["Ledger", "Departments", "P&L"], image: v2("finance-accounting.png") },
        ] },
      { id: "administration-department", label: "Administration Department", iconKey: "HiOutlineBriefcase", plan: "professional",
        summary: "Printout handling, bookings, visitors, resources and housekeeping for the workspace's day-to-day.",
        image: v2("admin-printout-management.png"),
        children: [
          { id: "admin-printout-management", label: "Printout Management", iconKey: "HiOutlineDocumentText",
            summary: "The Administration-side workspace for handling printout requests from employees and tenant-company employees.",
            bullets: ["Printout Requests and Printout History"], image: v2("admin-printout-management.png") },
          { id: "admin-bookings", label: "Bookings", iconKey: "MdMeetingRoom",
            summary: "Uses the Meeting Room Booking workflow already documented under Common Modules.",
            bullets: ["Create, view, reschedule and manage bookings"], image: v2("meeting-room-booking.png") },
          { id: "admin-visitors-management", label: "Visitors Management", iconKey: "HiOutlineIdentification",
            summary: "Uses the Visitor Management workflow already documented under Key Apps.",
            bullets: ["Registration, check-in, check-out and related actions"], image: v2("visitor-management.png") },
          { id: "admin-resource-management", label: "Resource Management", iconKey: "HiOutlineCollection",
            summary: "Works with resources already configured through Resource & Pricing and booking modules.",
            bullets: ["Resource creation, availability, capacity, pricing, booking configuration"], image: v2("sales-resource-pricing.png") },
          { id: "admin-house-keeping", label: "Housekeeping", iconKey: "HiOutlineClipboardCheck",
            summary: "Manage housekeeping staff, routine cleaning tasks, booking-generated tasks, history and performance.",
            bullets: [
              "Housekeeping Staff, Daily Scheduled Tasks, Booking-Based Tasks",
              "Task History and Staff Performance",
            ], image: v2("admin-house-keeping.png") },
        ] },
      { id: "hr-department", label: "HR Department", iconKey: "HiOutlineUsers", plan: "custom",
        summary: "Employee lifecycle management — records, recruitment, leave, attendance, payroll and resignations.",
        image: v2("hr-company-management.png"),
        children: [
          { id: "hr-company-management", label: "Company Management", iconKey: "HiOutlineOfficeBuilding",
            summary: "Manage employee records, company SOPs, company policies, and month-wise birthdays.",
            bullets: [
              "Employee Management: records, status, departments, roles, invitations, access",
              "Company SOP and Company Policies libraries",
            ], image: v2("hr-company-management.png") },
          { id: "hr-documents", label: "Documents", iconKey: "HiOutlineDocumentText",
            summary: "A centralized Document Vault for employee-related documents.",
            bullets: [
              "Organized by employment status and department",
              "Guide walkthrough + export of document information",
            ], image: v2("hr-documents.png") },
          { id: "hr-recruitment", label: "Recruitment", iconKey: "HiOutlineBriefcase",
            summary: "A centralized Applicant Tracking System for job openings and candidates.",
            bullets: [
              "Job Openings: positions, vacancies, application stats, posting status",
              "Candidate tracking through recruitment stages",
            ], image: v2("hr-recruitment.png") },
          { id: "hr-leave-request-processing", label: "Leave Request Processing", iconKey: "HiOutlineLogout",
            summary: "Review and manage employee leave requests from one interface.",
            bullets: [
              "Monitor employees currently on leave",
              "Leave Master, Leave Quotas, and Holidays & Events",
            ], image: v2("hr-leave-request-processing.png") },
          { id: "hr-attendance-review", label: "Attendance Review", iconKey: "HiOutlineClock",
            summary: "Monitor employee attendance and manage correction requests.",
            bullets: ["Attendance Master: records, status, hours, shifts", "Correction Requests queue"], image: v2("hr-attendance-review.png") },
          { id: "hr-payroll-management", label: "Payroll Management", iconKey: "HiOutlineCash",
            summary: "Calculate monthly salaries from CTC, apply attendance-based calculations, prepare payroll.",
            bullets: ["Payroll Master and Payroll History"], image: v2("hr-payroll-management.png") },
          { id: "hr-resignation-management", label: "Resignation Management", iconKey: "HiOutlineLogout",
            summary: "Review and manage employee resignation and offboarding activity.",
            bullets: ["Requests, Active Notice, and History"], image: v2("hr-resignation-management.png") },
        ] },
      { id: "it-department", label: "IT Department", iconKey: "HiOutlineChip", plan: "custom",
        summary: "Repair activity for IT assets, devices, networks and systems.",
        image: v2("it-repair-logs.png"),
        children: [
          { id: "it-repair-logs", label: "IT Repair Logs", iconKey: "HiOutlineChip",
            summary: "Record, monitor, assign and track IT-related repair activity.",
            bullets: ["Active Logs", "History"], image: v2("it-repair-logs.png") },
        ] },
      { id: "maintenance-department", label: "Maintenance Department", iconKey: "HiOutlineWrenchScrewdriver", plan: "custom",
        summary: "Repair work orders and preventive maintenance scheduling for company assets.",
        image: v2("maintenance-repair-logs.png"),
        children: [
          { id: "maintenance-repair-logs", label: "Maintenance Repair Logs", iconKey: "HiOutlineWrenchScrewdriver",
            summary: "Create, assign, monitor and track maintenance-related repair work orders.",
            bullets: ["My Work", "History"], image: v2("maintenance-repair-logs.png") },
          { id: "maintenance-amc-schedule", label: "AMC Maintenance Schedule", iconKey: "HiOutlineCalendar",
            summary: "Create and monitor preventive maintenance schedules for assets.",
            bullets: ["Master AMC Schedule"], image: v2("maintenance-amc-schedule.png") },
        ] },
      {
        // Last on purpose: every module here duplicates what Key Apps >
        // Website Builder already shows — this is that same feature
        // surfaced again under Tech's own department access.
        id: "tech-department", label: "Tech Department", iconKey: "HiOutlineChip", plan: "professional",
        summary: "The company website and the activity it generates, managed by the Tech team.",
        image: v1("create-edit-website.png"),
        children: [
          { id: "tech-website-builder", label: "Website Builder", iconKey: "HiOutlineGlobeAlt",
            summary: "Edit Website, Website Leads, Website Review and Careers in one hub.",
            bullets: ["Same Website Builder documented under Key Apps"], image: v1("create-edit-website.png") },
          { id: "tech-website-leads", label: "Website Leads", iconKey: "HiOutlineMailOpen",
            summary: "Track and manage enquiries received through the website.",
            bullets: ["Lead summary, filters, search and management"], image: v1("website-leads.gif") },
          { id: "tech-website-review", label: "Website Review", iconKey: "HiOutlineStar",
            summary: "Moderate visitor-submitted website reviews.",
            bullets: ["Same Website Review documented under Key Apps > Website Builder"], image: v1("website-review.gif") },
        ] },
    ],
  },
  {
    id: "add-ons",
    label: "Add-ons",
    order: 5,
    modules: [
      { id: "profile", label: "Profile", iconKey: "HiOutlineUserCircle", plan: "basic",
        summary: "Personal and workspace settings, grouped under the Profile add-on.",
        image: v1("my-profile.png"),
        children: [
          { id: "my-profile", label: "My Profile", iconKey: "HiOutlineUserCircle",
            summary: "The signed-in member's personal record — identity, contact, employment, and org info.",
            bullets: [
              "Personal & Contact Details and Work Details sections",
              "Editable: phone, DOB, address, emergency contact (name/email are read-only)",
            ], image: v1("my-profile.png") },
          { id: "company-profile", label: "Company Profile", iconKey: "HiOutlineOfficeBuilding",
            summary: "Active workspace identity and business-location information used across the Host Panel.",
            bullets: [
              "Company name, logo, current plan label; Upgrade Plan option",
              "Danger Zone: Delete My Account (destructive, requires confirmation)",
            ], image: v1("company-profile.png") },
          { id: "plan-and-billing", label: "Plan and Billing", iconKey: "HiOutlineCash",
            summary: "Current plan, included modules, and recorded plan payments.",
            bullets: [
              "Plan summary: status, start date, expiry date",
              "Included Modules tab grouped by product area",
            ], image: v1("plan-and-billing.png") },
          { id: "change-password", label: "Change Password", iconKey: "HiOutlineLockClosed",
            summary: "Replace the account password after verifying the current one.",
            bullets: ["Verify current password before new-password fields unlock"], image: v1("change-password.png") },
        ] },
    ],
  },
];

// --- upload + upsert --------------------------------------------------------

const uploadCache = new Map();

const uploadImageRef = async (categoryId, moduleId, imageRef) => {
  if (!imageRef) return { url: "", key: "" };

  const filePath = path.join(imageRef.dir, imageRef.filename);
  const cacheKey = filePath;
  if (uploadCache.has(cacheKey)) return uploadCache.get(cacheKey);

  if (!fs.existsSync(filePath)) {
    console.warn(`  ! Missing asset for ${categoryId}/${moduleId}: ${filePath} — leaving image empty`);
    const empty = { url: "", key: "" };
    uploadCache.set(cacheKey, empty);
    return empty;
  }

  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(imageRef.filename).toLowerCase();
  const mimetype = MIME_BY_EXT[ext] || "image/png";
  const key = `host-modules/${categoryId}/${moduleId}${ext}`;

  const { url } = await uploadFileToS3(key, { buffer, mimetype });
  const result = { url, key };
  uploadCache.set(cacheKey, result);
  console.log(`  uploaded ${imageRef.filename} -> ${url}`);
  return result;
};

const buildModule = async (categoryId, module) => {
  const { image: imageRef, children = [], ...rest } = module;
  const image = await uploadImageRef(categoryId, module.id, imageRef);
  const builtChildren = [];
  for (const child of children) {
    builtChildren.push(await buildModule(categoryId, child));
  }
  return { ...rest, image, children: builtChildren };
};

const seedHostModuleCatalog = async () => {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is required");
  }

  await mongoose.connect(process.env.MONGO_URL);

  for (const category of CATEGORIES) {
    console.log(`Seeding category: ${category.label} (${category.id})`);
    const modules = [];
    for (const module of category.modules) {
      modules.push(await buildModule(category.id, module));
    }

    await HostModuleCategory.findOneAndUpdate(
      { id: category.id },
      { id: category.id, label: category.label, order: category.order, modules },
      { upsert: true, new: true },
    );
  }

  console.log(`Done. Seeded ${CATEGORIES.length} categories.`);
};

seedHostModuleCatalog()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
