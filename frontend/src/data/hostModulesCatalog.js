import {
  HiOutlineViewGrid,
  HiOutlineGlobeAlt,
  HiOutlineMap,
  HiOutlineCollection,
  HiOutlineKey,
  HiOutlineChartBar,
  HiOutlineUserCircle,
  HiOutlineOfficeBuilding,
  HiOutlineCash,
  HiOutlineLockClosed,
  HiOutlineBriefcase,
  HiOutlinePencilAlt,
  HiOutlineMailOpen,
  HiOutlineStar,
  HiOutlineClipboardList,
  HiOutlineBadgeCheck,
  HiOutlineIdentification,
  HiOutlineClock,
  HiOutlineClipboardCheck,
  HiOutlineCalendar,
  HiOutlineLogout,
  HiOutlineUsers,
  HiOutlineTrendingUp,
  HiOutlineCurrencyDollar,
  HiOutlineChip,
  HiOutlineDocumentText,
  HiOutlineCreditCard,
  HiOutlineUserGroup,
  HiOutlineAdjustments,
} from "react-icons/hi";
import { MdOutlineSupportAgent, MdMeetingRoom, MdOutlineFingerprint } from "react-icons/md";
import { HiOutlineWrenchScrewdriver } from "react-icons/hi2";

import myProfileBasic from "../assets/host-panel-mock/my-profile.png";
import companyProfileBasic from "../assets/host-panel-mock/company-profile.png";
import planAndBillingBasic from "../assets/host-panel-mock/plan-and-billing.png";
import changePasswordBasic from "../assets/host-panel-mock/change-password.png";

import dashboard from "../assets/host-panel-mock-v2/dashboard.png";
import customerSupport from "../assets/host-panel-mock-v2/customer-support.png";
import tickets from "../assets/host-panel-mock-v2/tickets.png";
import meetingRoomBooking from "../assets/host-panel-mock-v2/meeting-room-booking.png";
import calendarImg from "../assets/host-panel-mock-v2/calendar.png";
import printouts from "../assets/host-panel-mock-v2/printouts.png";
import attendance from "../assets/host-panel-mock-v2/attendance.png";
import tasks from "../assets/host-panel-mock-v2/tasks.png";
import leaveRequests from "../assets/host-panel-mock-v2/leave-requests.png";

import assets from "../assets/host-panel-mock-v2/assets.png";
import inventory from "../assets/host-panel-mock-v2/inventory.png";
import financeManagement from "../assets/host-panel-mock-v2/finance-management.png";
import teamManagement from "../assets/host-panel-mock-v2/team-management.png";
import reports from "../assets/host-panel-mock-v2/reports.png";

import websiteBuilder from "../assets/host-panel-mock-v2/website-builder.png";
import nomadListings from "../assets/host-panel-mock-v2/nomad-listings.png";
import allLeads from "../assets/host-panel-mock-v2/all-leads.png";
import visitorManagement from "../assets/host-panel-mock-v2/visitor-management.png";

import organizationManagement from "../assets/host-panel-mock-v2/organization-management.png";
import accessGrants from "../assets/host-panel-mock-v2/access-grants.png";
import analytics from "../assets/host-panel-mock-v2/analytics.png";
import unitSettings from "../assets/host-panel-mock-v2/unit-settings.png";
import unitManagement from "../assets/host-panel-mock-v2/unit-management.png";

import hrCompanyManagement from "../assets/host-panel-mock-v2/hr-company-management.png";
import hrDocuments from "../assets/host-panel-mock-v2/hr-documents.png";
import hrRecruitment from "../assets/host-panel-mock-v2/hr-recruitment.png";
import hrLeaveRequestProcessing from "../assets/host-panel-mock-v2/hr-leave-request-processing.png";
import hrAttendanceReview from "../assets/host-panel-mock-v2/hr-attendance-review.png";
import hrPayrollManagement from "../assets/host-panel-mock-v2/hr-payroll-management.png";
import hrResignationManagement from "../assets/host-panel-mock-v2/hr-resignation-management.png";

import adminPrintoutManagement from "../assets/host-panel-mock-v2/admin-printout-management.png";
import adminHouseKeeping from "../assets/host-panel-mock-v2/admin-house-keeping.png";

import salesLeadsManagement from "../assets/host-panel-mock-v2/sales-leads-management.png";
import salesTenantCompanies from "../assets/host-panel-mock-v2/sales-tenant-companies.png";
import salesVirtualOffices from "../assets/host-panel-mock-v2/sales-virtual-offices.png";
import salesResourcePricing from "../assets/host-panel-mock-v2/sales-resource-pricing.png";
import salesArchitecture from "../assets/host-panel-mock-v2/sales-architecture.png";

import financeExpensesBudget from "../assets/host-panel-mock-v2/finance-expenses-budget.png";
import financeBillingPayments from "../assets/host-panel-mock-v2/finance-billing-payments.png";
import financeAccounting from "../assets/host-panel-mock-v2/finance-accounting.png";

import maintenanceRepairLogs from "../assets/host-panel-mock-v2/maintenance-repair-logs.png";
import maintenanceAmcSchedule from "../assets/host-panel-mock-v2/maintenance-amc-schedule.png";

import techDepartment from "../assets/host-panel-mock-v2/tech-department.png";
import itRepairLogs from "../assets/host-panel-mock-v2/it-repair-logs.png";

import createEditWebsite from "../assets/host-panel-mock/create-edit-website.png";
import websiteLeadsShot from "../assets/host-panel-mock/website-leads.gif";
import websiteReviewShot from "../assets/host-panel-mock/website-review.gif";

// MOCK content for manager review. Structure, copy and screenshots are
// sourced from the dev team's own documentation:
// - "WONO Basic Plan Host Panel Dashboard.docx"
// - "Merged WoNo PROFESSIONAL PLAN.docx"
// - "Wono Customise Plan Documentation.docx"
// The Customise doc's own "Add-Ons" plan matrix is what fixes each module's
// plan tier below (Basic / Professional / Custom) and confirms the real
// category names: Common Modules, Extra Common Modules, Key Apps, Core
// Modules, Department Accesses. Once approved, this file's content moves to
// the master (editable) config so future module/plan changes don't need a
// code change.

export const hostModuleCategories = [
  {
    id: "common-modules",
    label: "Common Modules",
    modules: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: HiOutlineViewGrid,
        plan: "basic",
        summary:
          "The main page after logging in — a consolidated view of activity across every enabled module without opening each one individually.",
        bullets: [
          "Review attendance, tenants, bookings, tickets, visitors, leads, leave activity and department metrics from one screen",
          "Business-unit selector to switch the location being reviewed",
          "Quick links and recent-activity cards open the related operational module",
        ],
        image: dashboard,
      },
      {
        id: "customer-support",
        label: "Customer Support",
        icon: MdOutlineSupportAgent,
        plan: "basic",
        summary:
          "Raise support issues directly to the WONO team, track progress, and review resolutions.",
        bullets: [
          "Review open and resolved WONO support tickets with status filters and search",
          "Raise an issue with a title, description, affected page and attachments",
          "Submit immediately or save as a draft",
        ],
        image: customerSupport,
      },
      {
        id: "tickets",
        label: "Tickets",
        icon: HiOutlineClipboardList,
        plan: "professional",
        summary:
          "Internal ticketing — report issues and route them to the responsible department for resolution.",
        bullets: [
          "Separate Company, Tenant Company, My Assigned and My Raised views",
          "Filter by status or department, search by ticket information",
          "Raise a ticket using an existing or custom issue type; export ticket data",
        ],
        image: tickets,
      },
      {
        id: "meeting-room-booking",
        label: "Meeting Room Booking",
        icon: MdMeetingRoom,
        plan: "professional",
        summary:
          "Reserve meeting rooms, manage bookings for members, external visitors and tenant companies.",
        bullets: [
          "Personal, internal, external and tenant-company reservations",
          "Live availability check by room, date and time",
          "View, reschedule or cancel eligible bookings; export booking data",
        ],
        image: meetingRoomBooking,
      },
      {
        id: "calendar",
        label: "Calendar",
        icon: HiOutlineCalendar,
        plan: "professional",
        summary:
          "A unified monthly view of activity scheduled across the workspace — bookings and tickets in one place.",
        bullets: [
          "Move between months, jump back to Today, select a date to view its events",
          "Open an event to review the related information",
          "Search or filter by event type (record creation stays in the source module)",
        ],
        image: calendarImg,
      },
      {
        id: "printouts",
        label: "Printouts",
        icon: HiOutlineDocumentText,
        plan: "professional",
        summary: "Send documents to the front desk for printing and track each request.",
        bullets: [
          "Create a request with copies, priority, color, paper size and documents",
          "View or edit a pending request, cancel where allowed",
          "Track Pending, In Progress, Completed, Rejected or Cancelled",
        ],
        image: printouts,
      },
      {
        id: "attendance",
        label: "Attendance",
        icon: MdOutlineFingerprint,
        plan: "custom",
        summary:
          "Record daily attendance, track working hours and breaks, and manage correction requests.",
        bullets: [
          "My Attendance: clock in/out with selfie + location verification",
          "Team Attendance where role access permits",
          "Corrections: request or review attendance corrections",
        ],
        image: attendance,
      },
      {
        id: "tasks",
        label: "Tasks",
        icon: HiOutlineClipboardCheck,
        plan: "custom",
        summary: "Create, assign, monitor and track work across the organization.",
        bullets: [
          "Switch between company tasks and tasks assigned to you",
          "Search, filter by status or department, review priority and due dates",
          "Assign to yourself or a department with instructions and reference files",
        ],
        image: tasks,
      },
      {
        id: "leave-requests",
        label: "Leave Requests",
        icon: HiOutlineLogout,
        plan: "custom",
        summary:
          "Apply for leave, track personal requests, and handle approvals based on role.",
        bullets: [
          "My Leaves: review balances, submit leave, track personal requests",
          "Full Day, Half Day or Partial leave with calculated deduction preview",
          "Company Leaves for org-wide visibility; Leave Requests queue for approvers",
        ],
        image: leaveRequests,
      },
    ],
  },
  {
    id: "extra-common-modules",
    label: "Extra Common Modules",
    modules: [
      {
        id: "assets",
        label: "Assets",
        icon: HiOutlineCollection,
        plan: "custom",
        summary:
          "A central record of company assets — location, owning department, assignment, and status.",
        bullets: [
          "Add, edit or transfer assets; raise asset-related issues",
          "Review quantities, warranty and ownership information",
          "Department asset requests, plus export",
        ],
        image: assets,
      },
      {
        id: "inventory",
        label: "Inventory",
        icon: HiOutlineCollection,
        plan: "custom",
        summary: "Manage consumable and returnable stock across the organization.",
        bullets: [
          "Track stock by item, category and owning department",
          "Increase for purchases, decrease for consumption, transfer between departments",
          "Monthly stock balances, ledger activity, export",
        ],
        image: inventory,
      },
      {
        id: "finance-management",
        label: "Finance Management",
        icon: HiOutlineCash,
        plan: "custom",
        summary:
          "A centralized view of company budgets, spending, and financial activity across departments.",
        bullets: [
          "Executive Finance Hub: budget, year-to-date spend, finance requests",
          "Approval Center: projected annual budget + extra budget requests",
          "Master Overview compares approved budget, spend and balance by department",
        ],
        image: financeManagement,
      },
      {
        id: "team-management",
        label: "Team Management",
        icon: HiOutlineUserGroup,
        plan: "custom",
        summary:
          "A central place to review team members, manage access, and view department SOPs/policies.",
        bullets: [
          "Team roster and employee status in Access Control",
          "Search or filter team members by status",
          "View department SOPs and policies available to the manager",
        ],
        image: teamManagement,
      },
      {
        id: "reports",
        label: "Reports",
        icon: HiOutlineDocumentText,
        plan: "custom",
        summary:
          "A central archive for viewing, filtering, previewing and downloading structured reports.",
        bullets: [
          "Filter by category, department, month or reporting window",
          "Preview or download available reports",
          "Export in PDF or Excel",
        ],
        image: reports,
      },
    ],
  },
  {
    id: "key-apps",
    label: "Key Apps",
    modules: [
      {
        id: "website-builder",
        label: "Website Builder",
        icon: HiOutlineGlobeAlt,
        plan: "basic",
        summary:
          "Create and manage the business website — plus website enquiries, reviews and career applications from the same hub.",
        image: websiteBuilder,
        children: [
          {
            id: "create-edit-website",
            label: "Create / Edit Website",
            icon: HiOutlinePencilAlt,
            summary:
              "Choose a template, configure every page, preview, then publish using website credits.",
            bullets: [
              "Configure Home, About, Services, Gallery, Partner, Careers and Contact content",
              "Preview the site before publishing; use the published URL after release",
              "Edit the website or change template later",
            ],
            image: createEditWebsite,
          },
          {
            id: "website-leads-page",
            label: "Website Leads",
            icon: HiOutlineMailOpen,
            summary: "Enquiries submitted through forms on the published website.",
            bullets: [
              "Total / Pending / Closed summary cards",
              "Website-sourced only — All Leads combines this with Nomad enquiries",
            ],
            image: websiteLeadsShot,
          },
          {
            id: "website-review-page",
            label: "Website Review",
            icon: HiOutlineStar,
            summary: "Visitor-submitted website reviews, moderated by the host.",
            bullets: [
              "Approve feedback that can be shown publicly, reject spam or abuse",
              "Separate from Nomad Listing reviews",
            ],
            image: websiteReviewShot,
          },
          {
            id: "careers-page",
            label: "Careers",
            icon: HiOutlineBriefcase,
            summary:
              "Publish job openings on the website and manage applications. Locked until a website exists.",
            bullets: [
              "Job Openings tab: vacancies, status, Publish Job",
              "Applications: Screening → Interview Scheduled → Interviewed → Selected",
            ],
            image: websiteBuilder,
          },
        ],
      },
      {
        id: "nomad-listings",
        label: "Nomad Listings",
        icon: HiOutlineMap,
        plan: "basic",
        summary:
          "Manage the business listings displayed through the WONO Nomads platform.",
        image: nomadListings,
        children: [
          {
            id: "listings",
            label: "Listings",
            icon: HiOutlineCollection,
            summary: "Create and manage business listings shown through WONO Nomads.",
            bullets: [
              "Search and filter listings, then view or edit details",
              "Add listing images, business information and supported content",
            ],
            image: nomadListings,
          },
          {
            id: "nomad-reviews",
            label: "Reviews",
            icon: HiOutlineStar,
            summary: "Manage listing reviews and their public display.",
            bullets: ["Filter by status, rating, product type, and listing"],
            image: nomadListings,
          },
          {
            id: "nomad-leads",
            label: "Leads",
            icon: HiOutlineMailOpen,
            summary: "Enquiries submitted from Nomad listings.",
            bullets: [
              "Total / Pending / Closed summary",
              "Source-specific — All Leads combines this with website enquiries",
            ],
            image: allLeads,
          },
          {
            id: "verify-business",
            label: "Verify Business",
            icon: HiOutlineBadgeCheck,
            summary: "Manages the blue verified badge for active public Nomad listings.",
            bullets: [
              "Unlocks once the company has an active public listing",
              "Listings, Status, and Payment History tabs",
            ],
            image: nomadListings,
          },
        ],
      },
      {
        id: "all-leads",
        label: "All Leads",
        icon: HiOutlineMailOpen,
        plan: "basic",
        summary:
          "A combined view of leads received through the business's Website and Nomad Listings.",
        bullets: [
          "Filter by status and search for specific enquiries",
          "Review source and lead information from the combined list",
          "Use the source-specific modules when deeper action is required",
        ],
        image: allLeads,
      },
      {
        id: "visitor-management",
        label: "Visitor Management",
        icon: HiOutlineIdentification,
        plan: "basic",
        summary:
          "Register visitors, check them in/out, manage walk-ins, history and reusable client records.",
        image: visitorManagement,
        children: [
          {
            id: "daily-visitors",
            label: "Daily Visitors",
            icon: HiOutlineClock,
            summary: "Operational view of today's visitor activity.",
            bullets: ["Check visitors in, print passes, check them out"],
            image: visitorManagement,
          },
          {
            id: "visitor-history",
            label: "Visitor History",
            icon: HiOutlineClipboardList,
            summary: "Past visitor records, bookings and reusable client information.",
            bullets: ["Review visitor history and booking records"],
            image: visitorManagement,
          },
          {
            id: "standard-visitor",
            label: "Standard Visitor (Front Desk)",
            icon: HiOutlineIdentification,
            summary:
              "Register standard visitors; advanced flows (Unit Tour, Walk-In Booking, Verify Booking) where available.",
            bullets: ["New Visitor or Existing Visitor lookup", "Check-in generates a printable badge"],
            image: visitorManagement,
          },
        ],
      },
    ],
  },
  {
    id: "core-modules",
    label: "Core Modules",
    modules: [
      {
        id: "organization-management",
        label: "Organization Management",
        icon: HiOutlineOfficeBuilding,
        plan: "basic",
        summary:
          "The Founder manages platform users, departments, department managers, employees and org-level access.",
        bullets: [
          "Add users, review invitations, manage permitted user access",
          "View departments, members and managers",
          "Change department managers, add employees, create custom departments",
        ],
        image: organizationManagement,
      },
      {
        id: "access-grants",
        label: "Access Grants",
        icon: HiOutlineKey,
        plan: "basic",
        summary:
          "Review workspace members, their roles, and their access to modules available under the plan.",
        bullets: [
          "Filter users by role or access state; inspect member access records",
          "Grant or remove module access where permitted",
          "Protected-role behaviour and ownership-transfer controls for Founder access",
        ],
        image: accessGrants,
      },
      {
        id: "analytics",
        label: "Analytics",
        icon: HiOutlineChartBar,
        plan: "basic",
        summary: "A consolidated view of activity across every module enabled for the unit.",
        bullets: [
          "Platform totals, open items, activity scores and monthly trends",
          "Module-wise analytics for Common, Extra Common, Key Apps and Core Modules",
          "Department analytics across HR, Administration, Sales, Finance, Maintenance, Tech and IT",
        ],
        image: analytics,
      },
      {
        id: "unit-settings",
        label: "Unit Settings",
        icon: HiOutlineAdjustments,
        plan: "basic",
        summary:
          "The Founder manages business units linked to the account and configures settings per location.",
        bullets: [
          "View linked business units; create another unit and switch the active one",
          "Configure location, attendance, working hours and other workspace options",
        ],
        image: unitSettings,
      },
      {
        id: "unit-management",
        label: "Unit Management",
        icon: HiOutlineOfficeBuilding,
        plan: "basic",
        summary:
          "The Founder reviews and compares operational activity across linked business units.",
        bullets: [
          "Compare employees, tickets, bookings and other data across units",
          "Open detailed information for an individual unit, or switch into it",
        ],
        image: unitManagement,
      },
    ],
  },
  {
    id: "department-accesses",
    label: "Department Accesses",
    modules: [
      {
        id: "sales-department",
        label: "Sales Department",
        icon: HiOutlineTrendingUp,
        plan: "professional",
        summary:
          "Leads, tenant companies, virtual offices, resource pricing, and the workspace's sales architecture.",
        image: salesLeadsManagement,
        children: [
          {
            id: "sales-leads-management",
            label: "Leads Management",
            icon: HiOutlineMailOpen,
            summary:
              "Review incoming leads, track progress, update sales stage, convert into tenant opportunities.",
            bullets: [
              "All Website & Nomad Leads",
              "Unit Tour Leads, tracked through New → Contacted → Qualified → Converted / Lost",
            ],
            image: salesLeadsManagement,
          },
          {
            id: "sales-tenant-companies",
            label: "Tenant Companies",
            icon: HiOutlineOfficeBuilding,
            summary:
              "Onboard and manage companies occupying workspace resources — contracts, allocation, billing.",
            bullets: ["Tenant Companies list", "Extra Credits Requests"],
            image: salesTenantCompanies,
          },
          {
            id: "sales-virtual-offices",
            label: "Virtual Offices",
            icon: HiOutlineGlobeAlt,
            summary: "Onboard and manage companies using Virtual Office services.",
            bullets: ["Virtual Office Companies: rental plans, contracts, space allocation", "Rent Collections & Payments"],
            image: salesVirtualOffices,
          },
          {
            id: "sales-resource-pricing",
            label: "Resource & Pricing",
            icon: HiOutlineCreditCard,
            summary: "Configure the resources that can be booked or assigned to tenant companies.",
            bullets: ["Resources: rooms, desks, pricing, credits, availability", "Tenant Packages"],
            image: salesResourcePricing,
          },
          {
            id: "sales-architecture",
            label: "Sales Architecture",
            icon: HiOutlineMap,
            summary: "A visual view of how workspace resources are distributed across the location.",
            bullets: ["View/manage space for Tenant Companies, Virtual Offices, Internal Departments"],
            image: salesArchitecture,
          },
        ],
      },
      {
        id: "finance-department",
        label: "Finance Department",
        icon: HiOutlineCurrencyDollar,
        plan: "custom",
        summary: "Budgets, billing & payments, and full accounting for the workspace.",
        image: financeExpensesBudget,
        children: [
          {
            id: "finance-expenses-budget",
            label: "Expenses & Budget",
            icon: HiOutlineCash,
            summary:
              "Budget planning, approval tracking, extra budget requests, and expense records.",
            bullets: ["Projected Annual Budget", "Extra Budget Requests"],
            image: financeExpensesBudget,
          },
          {
            id: "finance-billing-payments",
            label: "Billing & Payments",
            icon: HiOutlineCreditCard,
            summary:
              "Billing, invoices, deposits, revenue collections, payroll payments, and transaction records.",
            bullets: ["Tenant Security Deposits", "Tenant Rent billing and payment records"],
            image: financeBillingPayments,
          },
          {
            id: "finance-accounting",
            label: "Accounting",
            icon: HiOutlineChartBar,
            summary: "Financial transactions, departmental financial info, and P&L reporting.",
            bullets: ["Ledger", "Departments", "P&L"],
            image: financeAccounting,
          },
        ],
      },
      {
        id: "administration-department",
        label: "Administration Department",
        icon: HiOutlineBriefcase,
        plan: "professional",
        summary:
          "Printout handling, bookings, visitors, resources and housekeeping for the workspace's day-to-day.",
        image: adminPrintoutManagement,
        children: [
          {
            id: "admin-printout-management",
            label: "Printout Management",
            icon: HiOutlineDocumentText,
            summary:
              "The Administration-side workspace for handling printout requests from employees and tenant-company employees.",
            bullets: ["Printout Requests and Printout History"],
            image: adminPrintoutManagement,
          },
          {
            id: "admin-bookings",
            label: "Bookings",
            icon: MdMeetingRoom,
            summary: "Uses the Meeting Room Booking workflow already documented under Common Modules.",
            bullets: ["Create, view, reschedule and manage bookings"],
            image: meetingRoomBooking,
          },
          {
            id: "admin-visitors-management",
            label: "Visitors Management",
            icon: HiOutlineIdentification,
            summary: "Uses the Visitor Management workflow already documented under Key Apps.",
            bullets: ["Registration, check-in, check-out and related actions"],
            image: visitorManagement,
          },
          {
            id: "admin-resource-management",
            label: "Resource Management",
            icon: HiOutlineCollection,
            summary:
              "Works with resources already configured through Resource & Pricing and booking modules.",
            bullets: ["Resource creation, availability, capacity, pricing, booking configuration"],
            image: salesResourcePricing,
          },
          {
            id: "admin-house-keeping",
            label: "Housekeeping",
            icon: HiOutlineClipboardCheck,
            summary:
              "Manage housekeeping staff, routine cleaning tasks, booking-generated tasks, history and performance.",
            bullets: [
              "Housekeeping Staff, Daily Scheduled Tasks, Booking-Based Tasks",
              "Task History and Staff Performance",
            ],
            image: adminHouseKeeping,
          },
        ],
      },
      {
        id: "hr-department",
        label: "HR Department",
        icon: HiOutlineUsers,
        plan: "custom",
        summary:
          "Employee lifecycle management — records, recruitment, leave, attendance, payroll and resignations.",
        image: hrCompanyManagement,
        children: [
          {
            id: "hr-company-management",
            label: "Company Management",
            icon: HiOutlineOfficeBuilding,
            summary:
              "Manage employee records, company SOPs, company policies, and month-wise birthdays.",
            bullets: [
              "Employee Management: records, status, departments, roles, invitations, access",
              "Company SOP and Company Policies libraries",
            ],
            image: hrCompanyManagement,
          },
          {
            id: "hr-documents",
            label: "Documents",
            icon: HiOutlineDocumentText,
            summary: "A centralized Document Vault for employee-related documents.",
            bullets: [
              "Organized by employment status and department",
              "Guide walkthrough + export of document information",
            ],
            image: hrDocuments,
          },
          {
            id: "hr-recruitment",
            label: "Recruitment",
            icon: HiOutlineBriefcase,
            summary:
              "A centralized Applicant Tracking System for job openings and candidates.",
            bullets: [
              "Job Openings: positions, vacancies, application stats, posting status",
              "Candidate tracking through recruitment stages",
            ],
            image: hrRecruitment,
          },
          {
            id: "hr-leave-request-processing",
            label: "Leave Request Processing",
            icon: HiOutlineLogout,
            summary: "Review and manage employee leave requests from one interface.",
            bullets: [
              "Monitor employees currently on leave",
              "Leave Master, Leave Quotas, and Holidays & Events",
            ],
            image: hrLeaveRequestProcessing,
          },
          {
            id: "hr-attendance-review",
            label: "Attendance Review",
            icon: HiOutlineClock,
            summary: "Monitor employee attendance and manage correction requests.",
            bullets: ["Attendance Master: records, status, hours, shifts", "Correction Requests queue"],
            image: hrAttendanceReview,
          },
          {
            id: "hr-payroll-management",
            label: "Payroll Management",
            icon: HiOutlineCash,
            summary:
              "Calculate monthly salaries from CTC, apply attendance-based calculations, prepare payroll.",
            bullets: ["Payroll Master and Payroll History"],
            image: hrPayrollManagement,
          },
          {
            id: "hr-resignation-management",
            label: "Resignation Management",
            icon: HiOutlineLogout,
            summary: "Review and manage employee resignation and offboarding activity.",
            bullets: ["Requests, Active Notice, and History"],
            image: hrResignationManagement,
          },
        ],
      },
      {
        id: "it-department",
        label: "IT Department",
        icon: HiOutlineChip,
        plan: "custom",
        summary: "Repair activity for IT assets, devices, networks and systems.",
        image: itRepairLogs,
        children: [
          {
            id: "it-repair-logs",
            label: "IT Repair Logs",
            icon: HiOutlineChip,
            summary: "Record, monitor, assign and track IT-related repair activity.",
            bullets: ["Active Logs", "History"],
            image: itRepairLogs,
          },
        ],
      },
      {
        id: "maintenance-department",
        label: "Maintenance Department",
        icon: HiOutlineWrenchScrewdriver,
        plan: "custom",
        summary: "Repair work orders and preventive maintenance scheduling for company assets.",
        image: maintenanceRepairLogs,
        children: [
          {
            id: "maintenance-repair-logs",
            label: "Maintenance Repair Logs",
            icon: HiOutlineWrenchScrewdriver,
            summary:
              "Create, assign, monitor and track maintenance-related repair work orders.",
            bullets: ["My Work", "History"],
            image: maintenanceRepairLogs,
          },
          {
            id: "maintenance-amc-schedule",
            label: "AMC Maintenance Schedule",
            icon: HiOutlineCalendar,
            summary: "Create and monitor preventive maintenance schedules for assets.",
            bullets: ["Master AMC Schedule"],
            image: maintenanceAmcSchedule,
          },
        ],
      },
      {
        // Last on purpose: every module here duplicates what Key Apps >
        // Website Builder already shows (same screenshots reused below) —
        // this is just that same feature surfaced again under Tech's own
        // department access, so it sits at the end of the list.
        id: "tech-department",
        label: "Tech Department",
        icon: HiOutlineChip,
        plan: "professional",
        summary: "The company website and the activity it generates, managed by the Tech team.",
        image: createEditWebsite,
        children: [
          {
            id: "tech-website-builder",
            label: "Website Builder",
            icon: HiOutlineGlobeAlt,
            summary: "Edit Website, Website Leads, Website Review and Careers in one hub.",
            bullets: ["Same Website Builder documented under Key Apps"],
            image: createEditWebsite,
          },
          {
            id: "tech-website-leads",
            label: "Website Leads",
            icon: HiOutlineMailOpen,
            summary: "Track and manage enquiries received through the website.",
            bullets: ["Lead summary, filters, search and management"],
            image: websiteLeadsShot,
          },
          {
            id: "tech-website-review",
            label: "Website Review",
            icon: HiOutlineStar,
            summary: "Moderate visitor-submitted website reviews.",
            bullets: ["Same Website Review documented under Key Apps > Website Builder"],
            image: websiteReviewShot,
          },
        ],
      },
    ],
  },
  {
    id: "add-ons",
    label: "Add-ons",
    modules: [
      {
        id: "profile",
        label: "Profile",
        icon: HiOutlineUserCircle,
        plan: "basic",
        summary:
          "Personal and workspace settings, grouped under the Profile add-on.",
        image: myProfileBasic,
        children: [
          {
            id: "my-profile",
            label: "My Profile",
            icon: HiOutlineUserCircle,
            summary:
              "The signed-in member's personal record — identity, contact, employment, and org info.",
            bullets: [
              "Personal & Contact Details and Work Details sections",
              "Editable: phone, DOB, address, emergency contact (name/email are read-only)",
            ],
            image: myProfileBasic,
          },
          {
            id: "company-profile",
            label: "Company Profile",
            icon: HiOutlineOfficeBuilding,
            summary:
              "Active workspace identity and business-location information used across the Host Panel.",
            bullets: [
              "Company name, logo, current plan label; Upgrade Plan option",
              "Danger Zone: Delete My Account (destructive, requires confirmation)",
            ],
            image: companyProfileBasic,
          },
          {
            id: "plan-and-billing",
            label: "Plan and Billing",
            icon: HiOutlineCash,
            summary: "Current plan, included modules, and recorded plan payments.",
            bullets: [
              "Plan summary: status, start date, expiry date",
              "Included Modules tab grouped by product area",
            ],
            image: planAndBillingBasic,
          },
          {
            id: "change-password",
            label: "Change Password",
            icon: HiOutlineLockClosed,
            summary: "Replace the account password after verifying the current one.",
            bullets: ["Verify current password before new-password fields unlock"],
            image: changePasswordBasic,
          },
        ],
      },
    ],
  },
];

const findInModules = (modules, moduleId) => {
  for (const module of modules) {
    if (module.id === moduleId) return { module, parent: null };
    if (module.children) {
      const child = module.children.find((c) => c.id === moduleId);
      if (child) return { module: child, parent: module };
    }
  }
  return null;
};

export const findModule = (categoryId, moduleId) => {
  const category = hostModuleCategories.find((c) => c.id === categoryId);
  if (!category) return null;
  const found = findInModules(category.modules, moduleId);
  if (!found) return null;
  return { category, parent: found.parent, module: found.module };
};

// Used to wire the real site sidebar's existing (currently static) item
// labels into a specific module section on /modules, by matching label text.
export const findModuleByLabel = (label) => {
  if (!label) return null;
  const normalized = label.trim().toLowerCase();
  for (const category of hostModuleCategories) {
    for (const module of category.modules) {
      if (module.label.toLowerCase() === normalized) {
        // A module with children has no page block/anchor of its own
        // (ModuleCategoryBlock flattens it away) — land on its first
        // child instead, which is always a real, renderable anchor.
        const anchorId = module.children?.length ? module.children[0].id : module.id;
        return { categoryId: category.id, moduleId: anchorId };
      }
      if (module.children) {
        const child = module.children.find(
          (c) => c.label.toLowerCase() === normalized,
        );
        if (child) return { categoryId: category.id, moduleId: child.id };
      }
    }
  }
  return null;
};
