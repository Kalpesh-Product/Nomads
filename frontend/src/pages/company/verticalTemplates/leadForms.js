// Lead-form definitions for the new templates. The older templates keep using
// `getLeadFieldsForProduct` in useWebsiteTemplateData.ts; this is separate so the
// richer field types (time slots, selects, notes) can't disturb them.
import { getServiceProfile } from "./verticalProfiles";
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const toMinutes = (hhmm) => {
    const [h, m] = String(hhmm || "").split(":").map(Number);
    return Number.isFinite(h) ? h * 60 + (Number.isFinite(m) ? m : 0) : NaN;
};
const fmt = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
/** 12-hour label for a HH:mm value, e.g. "18:30" -> "6:30 PM". */
export const formatTime12h = (hhmm) => {
    const minutes = toMinutes(hhmm);
    if (!Number.isFinite(minutes))
        return hhmm;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const suffix = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
};
/**
 * Bookable time slots for a date. Returns [] when the place is closed that day, and
 * `null` when there are no structured hours at all (caller falls back to a free
 * time input).
 */
export const generateTimeSlots = (openingHours, date, intervalMinutes = 30) => {
    const rows = Array.isArray(openingHours) ? openingHours : [];
    if (!rows.length)
        return null;
    if (!date)
        return null;
    const day = DAY_KEYS[new Date(`${date}T12:00:00`).getDay()];
    const row = rows.find((r) => r.day === day);
    if (!row || row.closed)
        return [];
    const open = toMinutes(row.open);
    let close = toMinutes(row.close);
    if (!Number.isFinite(open) || !Number.isFinite(close))
        return null;
    if (close <= open)
        close += 24 * 60; // closes after midnight
    const step = Math.max(5, intervalMinutes);
    const slots = [];
    // Last seating a step before closing.
    for (let t = open; t <= close - step; t += step)
        slots.push(fmt(t % (24 * 60)));
    return slots;
};
/**
 * Bookable end times for a date, including the closing time itself. Start times
 * stop one step before closing, so ends need their own generator.
 */
const generateEndTimeSlots = (openingHours, date, intervalMinutes = 30) => {
    const rows = Array.isArray(openingHours) ? openingHours : [];
    if (!rows.length)
        return null;
    if (!date)
        return null;
    const day = DAY_KEYS[new Date(`${date}T12:00:00`).getDay()];
    const row = rows.find((r) => r.day === day);
    if (!row || row.closed)
        return [];
    const open = toMinutes(row.open);
    let close = toMinutes(row.close);
    if (!Number.isFinite(open) || !Number.isFinite(close))
        return null;
    if (close <= open)
        close += 24 * 60; // closes after midnight
    const step = Math.max(5, intervalMinutes);
    const slots = [];
    for (let t = open + step; t <= close; t += step)
        slots.push(fmt(t % (24 * 60)));
    return slots;
};
const contactFields = () => [
    { key: "fullName", label: "Full name", type: "text", required: true, target: "form", half: true },
    { key: "mobile", label: "Mobile number", type: "tel", required: true, target: "form", half: true },
    { key: "email", label: "Email", type: "email", required: true, target: "form" },
];
const isoFromDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
/** YYYY-MM-DD shifted by whole days (used for the minimum 1-night hostel stay). */
export const addDaysISO = (value, days) => {
    const date = new Date(`${value || ""}T12:00:00`);
    return Number.isNaN(date.getTime()) ? "" : isoFromDate(new Date(date.setDate(date.getDate() + days)));
};
/** YYYY-MM-DD shifted by whole months, clamped to the last day of the target month. */
export const addMonthsISO = (value, months) => {
    const date = new Date(`${value || ""}T12:00:00`);
    if (Number.isNaN(date.getTime()))
        return "";
    const day = date.getDate();
    date.setDate(1);
    date.setMonth(date.getMonth() + months);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    date.setDate(Math.min(day, lastDay));
    return isoFromDate(date);
};
/** "14:30" + 90 => "16:00"; keeps meeting end time in sync with the duration pick-list. */
export const addMinutesToTime = (hhmm, minutes) => {
    const start = toMinutes(hhmm);
    return Number.isFinite(start) && Number.isFinite(Number(minutes)) ? fmt(start + Number(minutes)) : "";
};
export const DURATION_OPTIONS = [
    { value: "30", label: "30 mins" },
    { value: "60", label: "1 hr" },
    { value: "90", label: "1.5 hrs" },
    { value: "120", label: "2 hrs" },
    { value: "180", label: "3 hrs" },
    { value: "240", label: "4 hrs" },
    { value: "480", label: "8 hrs" },
];
/** Granularity of meeting-room start/end slots. 30 is the default; 5 gives ~108 options per dropdown. */
const MEETING_SLOT_MINUTES = 5;
const businessHourSlots = (intervalMinutes = 30) => {
    const step = Math.max(5, intervalMinutes);
    // 09:00 – 18:00, with the last start one step before closing.
    return Array.from({ length: Math.floor((9 * 60) / step) }, (_, i) => fmt((9 * 60) + (i * step)));
};
export const getLeadFormDefinition = (kind, ctx = {}) => {
    const profile = getServiceProfile(kind);
    const base = {
        title: profile.labels.leadTitle,
        submitLabel: profile.labels.leadSubmit,
        successMessage: profile.labels.leadSuccess,
        inquiryType: profile.inquiryType,
    };
    if (kind === "dayPass") {
        return {
            ...base,
            fields: [
                ...contactFields(),
                { key: "startDate", label: "Pass date", type: "date", required: true, target: "form", half: true, min: ctx.today },
                { key: "people", label: "Number of passes", type: "number", required: true, target: "form", half: true, min: 1, default: 1 },
                { key: "notes", label: "Special requests / notes", type: "textarea", target: "extra" },
            ],
        };
    }
    if (kind === "menu") {
        const maxGuests = Math.max(1, Number(ctx.reservation?.maxGuests) || 10);
        const slots = generateTimeSlots(ctx.openingHours, ctx.date, ctx.reservation?.slotIntervalMinutes || 30);
        const seating = (ctx.reservation?.seatingOptions || []).filter(Boolean);
        const hasHours = (ctx.openingHours || []).length > 0;
        // With structured hours the time is a pick-list for the chosen day; without any
        // hours there's nothing to derive slots from, so fall back to a free time input.
        const timeField = !hasHours
            ? { key: "time", label: "Preferred time", type: "time", required: true, target: "extra", half: true }
            : {
                key: "time",
                label: "Time",
                type: "select",
                required: true,
                target: "extra",
                half: true,
                options: (slots || []).map((s) => ({ value: s, label: formatTime12h(s) })),
                placeholder: slots === null ? "Pick a date first" : slots.length ? "Select a time" : "Closed on this day",
            };
        return {
            ...base,
            fields: [
                ...contactFields(),
                { key: "people", label: "Guests", type: "number", required: true, target: "form", half: true, min: 1, max: maxGuests },
                { key: "startDate", label: "Date", type: "date", required: true, target: "form", half: true, min: ctx.today },
                timeField,
                ...(seating.length
                    ? [
                        {
                            key: "seating",
                            label: "Seating",
                            type: "select",
                            target: "extra",
                            half: true,
                            options: seating.map((s) => ({ value: s, label: s })),
                            placeholder: "No preference",
                        },
                    ]
                    : []),
                { key: "notes", label: "Special requests or occasion", type: "textarea", target: "extra" },
            ],
        };
    }
    if (kind === "hostel" || kind === "workation") {
        const minCheckout = ctx.minCheckoutDate || ctx.date || ctx.today;
        return {
            ...base,
            fields: [
                ...contactFields(),
                { key: "startDate", label: "Check-in", type: "date", required: true, target: "form", half: true, min: ctx.today },
                { key: "endDate", label: "Check-out", type: "date", required: true, target: "form", half: true, min: minCheckout },
                {
                    key: "people",
                    label: kind === "hostel" && ctx.roomKind === "private" ? "Guests" : kind === "hostel" ? "Number of beds required" : "Guests",
                    type: "number",
                    required: true,
                    target: "form",
                    min: 1,
                },
                { key: "notes", label: "Anything we should know?", type: "textarea", target: "extra" },
            ],
        };
    }
    if (kind === "coLiving") {
        if (ctx.mode === "visit") {
            const slots = Array.from({ length: 9 }, (_, i) => fmt((10 + i) * 60)); // 10:00 – 18:00
            return {
                title: "Schedule a visit",
                submitLabel: "Request a visit",
                successMessage: "Thanks! We'll confirm your visit slot shortly.",
                inquiryType: "Tour Visit",
                fields: [
                    ...contactFields(),
                    { key: "startDate", label: "Visit date", type: "date", required: true, target: "form", half: true, min: ctx.today },
                    {
                        key: "time",
                        label: "Time",
                        type: "select",
                        required: true,
                        target: "extra",
                        half: true,
                        options: slots.map((s) => ({ value: s, label: formatTime12h(s) })),
                        placeholder: "Select a time",
                    },
                    { key: "notes", label: "What would you like to see?", type: "textarea", target: "extra" },
                ],
            };
        }
        const customStay = ctx.stayDurationChoice === "Custom";
        return {
            ...base,
            fields: [
                ...contactFields(),
                { key: "startDate", label: "Move-in date", type: "date", required: true, target: "form", half: true, min: ctx.today },
                {
                    key: "stayDuration",
                    label: "Stay duration",
                    type: "select",
                    required: true,
                    target: "extra",
                    half: true,
                    options: ["1 Month", "2 Months", "3 Months", "6 Months", "11 Months", "Custom"].map((value) => ({ value, label: value })),
                    placeholder: "Select duration",
                },
                ...(customStay
                    ? [{ key: "endDate", label: "Move-out date", type: "date", required: true, target: "form", half: true, min: ctx.minCheckoutDate || ctx.date || ctx.today }]
                    : []),
                { key: "people", label: "Occupants", type: "number", required: true, target: "form", min: 1 },
                { key: "notes", label: "Special requests / move-in notes", type: "textarea", target: "extra" },
            ],
        };
    }
    if (kind === "workspace") {
        const spaces = (ctx.spaces || []).filter(Boolean);
        if (ctx.mode === "visit") {
            const slots = generateTimeSlots(ctx.openingHours, ctx.date, 60);
            const hasHours = (ctx.openingHours || []).length > 0;
            const fallback = Array.from({ length: 9 }, (_, i) => fmt((9 + i) * 60)); // 09:00 – 17:00
            const options = hasHours ? slots || [] : fallback;
            return {
                title: "Book a visit",
                submitLabel: "Request a visit",
                successMessage: "Thanks! We'll confirm your visit slot shortly.",
                inquiryType: "Tour Visit",
                fields: [
                    ...contactFields(),
                    { key: "startDate", label: "Visit date", type: "date", required: true, target: "form", half: true, min: ctx.today },
                    {
                        key: "time",
                        label: "Time",
                        type: "select",
                        required: true,
                        target: "extra",
                        half: true,
                        options: options.map((slot) => ({ value: slot, label: formatTime12h(slot) })),
                        placeholder: hasHours && slots === null ? "Pick a date first" : options.length ? "Select a time" : "Closed on this day",
                    },
                    { key: "people", label: "People joining", type: "number", target: "form", min: 1 },
                    { key: "notes", label: "What would you like to see?", type: "textarea", target: "extra" },
                ],
            };
        }
        return {
            ...base,
            fields: [
                ...contactFields(),
                ...(spaces.length
                    ? [
                        {
                            key: "roomType",
                            label: "Interested in",
                            type: "select",
                            target: "extra",
                            options: spaces.map((name) => ({ value: name, label: name })),
                            placeholder: "Not sure yet",
                        },
                    ]
                    : []),
                { key: "people", label: "Team size", type: "number", required: true, target: "form", half: true, min: 1 },
                { key: "startDate", label: "Preferred start date", type: "date", target: "form", half: true, min: ctx.today },
                { key: "notes", label: "Tell us what you need", type: "textarea", target: "extra" },
            ],
        };
    }
    if (kind === "meeting") {
        const slots = generateTimeSlots(ctx.openingHours, ctx.date, MEETING_SLOT_MINUTES);
        const hasHours = (ctx.openingHours || []).length > 0;
        const options = hasHours ? slots || [] : businessHourSlots(MEETING_SLOT_MINUTES);
        // Ends run to the actual closing time, and can never precede the start.
        const endBase = hasHours
            ? generateEndTimeSlots(ctx.openingHours, ctx.date, MEETING_SLOT_MINUTES) || []
            : [...businessHourSlots(MEETING_SLOT_MINUTES), "18:00"];
        const endOptions = ctx.time ? endBase.filter((slot) => slot > ctx.time) : [];
        return {
            ...base,
            fields: [
                ...contactFields(),
                { key: "people", label: "Attendees", type: "number", required: true, target: "form", half: true, min: 1 },
                { key: "startDate", label: "Meeting date", type: "date", required: true, target: "form", half: true, min: ctx.today },
                {
                    key: "time",
                    label: "Start time",
                    type: "select",
                    required: true,
                    target: "extra",
                    half: true,
                    options: options.map((slot) => ({ value: slot, label: formatTime12h(slot) })),
                    placeholder: hasHours && slots === null ? "Pick a date first" : options.length ? "Select a time" : "Closed on this day",
                },
                {
                    key: "endTime",
                    label: "End time",
                    type: "select",
                    required: true,
                    target: "extra",
                    half: true,
                    options: endOptions.map((slot) => ({ value: slot, label: formatTime12h(slot) })),
                    placeholder: !ctx.time ? "Pick a start time first" : endOptions.length ? "Select end time" : "No later slots",
                },
                { key: "notes", label: "Requirements (e.g., projector, whiteboard)", type: "textarea", target: "extra" },
            ],
        };
    }
    return {
        ...base,
        fields: [
            ...contactFields(),
            { key: "people", label: "No. of people", type: "number", target: "form", half: true, min: 1 },
            { key: "startDate", label: "Preferred date", type: "date", target: "form", half: true, min: ctx.today },
            { key: "notes", label: "Message", type: "textarea", target: "extra" },
        ],
    };
};
/** Nights between two YYYY-MM-DD dates, or 0 when either is missing / reversed. */
export const nightsBetween = (start, end) => {
    if (!start || !end)
        return 0;
    const ms = new Date(`${end}T12:00:00`).getTime() - new Date(`${start}T12:00:00`).getTime();
    const nights = Math.round(ms / 86400000);
    return nights > 0 ? nights : 0;
};
/** Months between two YYYY-MM-DD dates, to one decimal (0 when missing / reversed). */
export const monthsBetween = (start, end) => {
    if (!start || !end)
        return 0;
    const from = new Date(`${start}T12:00:00`);
    const to = new Date(`${end}T12:00:00`);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from)
        return 0;
    const months = (to.getFullYear() - from.getFullYear()) * 12
        + (to.getMonth() - from.getMonth())
        + (to.getDate() - from.getDate()) / 30;
    return Math.max(0, Math.round(months * 10) / 10);
};
/** First run of digits (with decimals) in a price string, e.g. "₹1,200 / night" -> 1200. */
export const parsePriceNumber = (price) => {
    const match = String(price ?? "").replace(/,/g, "").match(/\d+(\.\d+)?/);
    return match ? Number(match[0]) : null;
};
export const todayISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
