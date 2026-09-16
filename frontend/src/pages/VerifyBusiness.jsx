import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Autocomplete,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
  ListSubheader,
  FormHelperText,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import blueUnderline from "../assets/blue_underline.png";
import Seo from "../components/Seo";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import { showErrorAlert, showSuccessAlert } from "../utils/alerts";
import { TIER_OPTIONS } from "../constants/verificationTiers";

const UploadFileInput = React.lazy(() => import("../components/UploadFileInput"));

const ROLE_OPTIONS = ["Founder", "Manager", "Employee", "Other"];
// Same vertical options as the Become a Host signup's "Type of Vertical" picker.
const INDUSTRY_OPTIONS = [
  "Co-working",
  "Co-living",
  "Hostel",
  "Workation",
  "Meetings",
  "Cafe",
];
// Maps Company.companyType (listing verticals) to the Industry / Type of
// Vertical checkbox options above, so a selected company's own listings can
// prefill the field. privatestay has no corresponding option and is skipped.
const COMPANY_TYPE_TO_INDUSTRY = {
  coworking: "Co-working",
  coliving: "Co-living",
  hostel: "Hostel",
  workation: "Workation",
  meetingroom: "Meetings",
  cafe: "Cafe",
};

const CONTINENT_OPTIONS = [
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "Oceania",
  "South America",
];

const floatingLabelSx = {
  color: "black",
  "&.Mui-focused": { color: "#1976d2" },
  "&.MuiInputLabel-shrink": { color: "#1976d2" },
};

// -------------------------------------------------------------------------
// Placeholder copy — the final wording for these sections (title, intro,
// terms & conditions) is pending review and will be supplied later.
// -------------------------------------------------------------------------
const LAST_UPDATED = "Last Updated: To be confirmed";

const VerifyBusiness = () => {
  const { auth } = useAuth();
  const userId = auth?.user?._id || auth?.user?.id;
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const initialCompanyId = searchParams.get("companyId") || "";
  const initialCompanyName = searchParams.get("companyName") || "";

  const [selectedCompany, setSelectedCompany] = useState(
    initialCompanyId
      ? {
          companyId: initialCompanyId,
          companyName: initialCompanyName,
          country: searchParams.get("country") || "",
          state: searchParams.get("state") || "",
          city: searchParams.get("city") || "",
          continent: searchParams.get("continent") || "",
          website: searchParams.get("website") || "",
          registeredEntityName: searchParams.get("registeredEntityName") || "",
        }
      : null,
  );
  const [companyQuery, setCompanyQuery] = useState(initialCompanyName);
  const [industryOpen, setIndustryOpen] = useState(false);

  // Anyone landing here without being logged in (e.g. a direct link) gets
  // sent to login and returned straight back to this page afterwards.
  useEffect(() => {
    if (!userId) {
      navigate("/login", {
        state: {
          redirectTo: `${location.pathname}${location.search}`,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      fullName: auth?.user?.fullName || "",
      email: auth?.user?.email || "",
      mobile: auth?.user?.contactNumber
        ? `${auth?.user?.contactCode || ""}${auth.user.contactNumber}`
        : "",
      businessName: initialCompanyName,
      role: "",
      country: auth?.user?.country || auth?.user?.countryOfResidence || "",
      industry: [],
      registeredCompanyName: searchParams.get("registeredEntityName") || "",
      companyCountry: searchParams.get("country") || "",
      companyState: searchParams.get("state") || "",
      companyCity: searchParams.get("city") || "",
      continent: searchParams.get("continent") || "",
      websiteUrl: searchParams.get("website") || "",
      requestedTier: "1m",
      proofDocument: null,
    },
  });

  // Once a company is (re)selected, default the business-side fields from it.
  useEffect(() => {
    if (!selectedCompany) return;
    setValue("businessName", selectedCompany.companyName || "");
    setValue(
      "registeredCompanyName",
      selectedCompany.registeredEntityName || "",
    );
    setValue("companyCountry", selectedCompany.country || "");
    setValue("companyState", selectedCompany.state || "");
    setValue("companyCity", selectedCompany.city || "");
    setValue("continent", selectedCompany.continent || "");
    setValue("websiteUrl", selectedCompany.website || "");
  }, [selectedCompany, setValue]);

  const { data: searchResults = [], isFetching: isSearching } = useQuery({
    queryKey: ["verification-company-search", companyQuery],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        `/verification/search-companies?q=${encodeURIComponent(companyQuery)}`,
      );
      return response.data;
    },
    enabled: !!userId && companyQuery.trim().length > 1,
  });

  const { data: verticals = [], isFetching: isLoadingVerticals } = useQuery({
    queryKey: ["verification-company-verticals", selectedCompany?.companyId],
    queryFn: async () => {
      const response = await axiosPrivate.get(
        `/company/get-listings/${selectedCompany.companyId}`,
      );
      return response.data;
    },
    enabled: !!userId && !!selectedCompany?.companyId,
  });

  // Prefill Industry / Type of Vertical from the listings this company
  // actually has, so the user doesn't have to re-select what we already know.
  useEffect(() => {
    if (!selectedCompany?.companyId || !verticals.length) return;
    const derived = Array.from(
      new Set(
        verticals
          .map((listing) => COMPANY_TYPE_TO_INDUSTRY[listing.companyType])
          .filter(Boolean),
      ),
    );
    if (derived.length) setValue("industry", derived);
  }, [verticals, selectedCompany?.companyId, setValue]);

  const { mutate: submitRequest, isPending } = useMutation({
    mutationFn: async (data) => {
      const fd = new FormData();
      const { proofDocument, industry, ...rest } = data;

      Object.entries(rest).forEach(([key, value]) => {
        if (value !== null && value !== undefined) fd.set(key, value);
      });
      fd.set("companyId", selectedCompany?.companyId || "");
      fd.set("companyName", selectedCompany?.companyName || "");
      fd.set("industry", JSON.stringify(industry || []));
      fd.set(
        "verticalsSnapshot",
        JSON.stringify(
          (verticals || []).map((listing) => ({
            businessId: listing.businessId,
            companyType: listing.companyType,
            city: listing.city,
          })),
        ),
      );
      if (proofDocument) fd.set("proofDocument", proofDocument);

      const response = await axiosPrivate.post("/verification/request", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      showSuccessAlert("Company verification request sent.").then(() => {
        navigate("/profile?tab=verification");
      });
    },
    onError: (error) => {
      showErrorAlert(
        error?.response?.data?.message ||
          "Failed to submit the verification request",
      );
    },
  });

  const onSubmit = (data) => {
    if (!selectedCompany?.companyId) {
      showErrorAlert("Please search for and select your business first");
      return;
    }
    submitRequest(data);
  };

  if (!userId) return null;

  const sections = [
    {
      title: LAST_UPDATED,
      content: (
        <p>
          <b>Business Verification</b> lets nomads know a listing's details —
          ownership, location, and contact information — have been confirmed
          by our team. This page explains how verification works and lets you
          submit a request for your business.
        </p>
      ),
    },
    {
      title: "1. What is Business Verification",
      content: (
        <p>
          Verified businesses display a blue verification badge next to their
          name across every listing under that business, so nomads can tell
          the details shown are accurate and up to date.
        </p>
      ),
    },
    {
      title: "2. Why Get Verified",
      content: (
        <p>
          Verification builds trust with nomads browsing your listings and
          signals that your business information is current. It applies at
          the business level — if your business has multiple listings across
          different verticals (co-working, co-living, workation, and so on),
          one verification request and approval covers all of them.
        </p>
      ),
    },
    {
      title: "3. Verification Plans & Pricing",
      content: (
        <>
          <p>Choose a plan when you submit your request below:</p>
          <ul className="pl-5 mt-2 list-disc">
            {TIER_OPTIONS.map((tier) => (
              <li key={tier.value}>
                {tier.label} — ${tier.price}
              </li>
            ))}
          </ul>
          <p className="mt-2">
            Payment isn't collected on this page — our team will reach out to
            arrange payment after reviewing your request.
          </p>
        </>
      ),
    },
    {
      title: "4. Terms & Conditions",
      content: (
        <p>
          By submitting a verification request you confirm that the details
          you provide are accurate and that you are authorized to represent
          the business. Final terms and conditions for this program will be
          published here.
        </p>
      ),
    },

    // -------------------------
    // Section with Embedded Form
    // -------------------------
    {
      title: "5. Request Business Verification",
      content: (
        <>
          <p>
            Search for your business, confirm the listings this will cover,
            and share a few details for our team to verify.
          </p>

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Company search - spans both columns */}
            <div className="md:col-span-2">
              <Autocomplete
                freeSolo
                options={searchResults}
                loading={isSearching}
                value={selectedCompany}
                inputValue={companyQuery}
                onInputChange={(_, value) => setCompanyQuery(value)}
                onChange={(_, value) => {
                  if (value && typeof value === "object") {
                    setSelectedCompany(value);
                  }
                }}
                getOptionLabel={(option) =>
                  typeof option === "string"
                    ? option
                    : option?.companyName || ""
                }
                isOptionEqualToValue={(option, value) =>
                  option.companyId === value?.companyId
                }
                renderOption={(props, option) => (
                  <li {...props} key={option.companyId}>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {option.companyName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {[option.city, option.country]
                          .filter(Boolean)
                          .join(", ")}
                        {" · "}
                        {option.verticals?.length || 0} listing(s)
                      </span>
                    </div>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Your Business"
                    variant="standard"
                    required
                    InputLabelProps={{ sx: floatingLabelSx }}
                  />
                )}
              />

              {selectedCompany?.companyId && (
                <div className="mt-3 text-sm text-gray-600">
                  {isLoadingVerticals ? (
                    "Checking listings for this business..."
                  ) : verticals.length ? (
                    <>
                      <span className="font-medium">
                        This will verify {verticals.length} listing(s):
                      </span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {verticals.map((listing) => (
                          <Chip
                            key={listing._id || listing.businessId}
                            label={`${listing.companyType} · ${listing.city || ""}`}
                            size="small"
                          />
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              )}
            </div>

            {/* Identity fields — prefetched, read-only */}
            <Controller
              name="fullName"
              control={control}
              rules={{ required: "Full name is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Full Name"
                  variant="standard"
                  required
                  InputProps={{ readOnly: true }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  InputLabelProps={{ sx: floatingLabelSx }}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              rules={{ required: "Email is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email ID"
                  variant="standard"
                  required
                  InputProps={{ readOnly: true }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  InputLabelProps={{ sx: floatingLabelSx }}
                />
              )}
            />

            <Controller
              name="mobile"
              control={control}
              rules={{ required: "Mobile number is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Mobile Number"
                  variant="standard"
                  required
                  InputProps={{ readOnly: true }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  InputLabelProps={{ sx: floatingLabelSx }}
                />
              )}
            />

            <Controller
              name="businessName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Business Name"
                  variant="standard"
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ sx: floatingLabelSx }}
                />
              )}
            />

            {/* Role */}
            <Controller
              name="role"
              control={control}
              rules={{ required: "Role is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Your Role"
                  variant="standard"
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  InputLabelProps={{ sx: floatingLabelSx }}
                >
                  <MenuItem value="">Select</MenuItem>
                  {ROLE_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {/* Personal country */}
            <Controller
              name="country"
              control={control}
              rules={{ required: "Country is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Your Country"
                  variant="standard"
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  InputLabelProps={{ sx: floatingLabelSx }}
                />
              )}
            />

            {/* Industry / Type of Vertical — same picker as the Become a Host signup */}
            <Controller
              name="industry"
              control={control}
              rules={{
                validate: (value) =>
                  Array.isArray(value) && value.length > 0
                    ? true
                    : "Select at least one industry/vertical",
              }}
              render={({ field, fieldState }) => (
                <FormControl
                  fullWidth
                  variant="standard"
                  error={!!fieldState.error}
                >
                  <InputLabel sx={floatingLabelSx}>
                    Industry / Type of Vertical
                  </InputLabel>
                  <Select
                    multiple
                    name={field.name}
                    open={industryOpen}
                    onOpen={() => setIndustryOpen(true)}
                    onClose={() => setIndustryOpen(false)}
                    value={field.value || []}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    inputRef={field.ref}
                    renderValue={(selected) => selected.join(", ")}
                    MenuProps={{ PaperProps: { sx: { pb: 0 } } }}
                  >
                    {INDUSTRY_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        <Checkbox
                          checked={(field.value || []).includes(option)}
                        />
                        <ListItemText primary={option} />
                      </MenuItem>
                    ))}
                    <ListSubheader
                      disableSticky
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        px: 1.5,
                        pt: 1,
                        pb: 0,
                        lineHeight: "normal",
                        borderTop: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                      }}
                    >
                      <Button
                        size="small"
                        variant="contained"
                        sx={{
                          minWidth: 72,
                          borderRadius: 999,
                          bgcolor: "#0BA9EF",
                          textTransform: "none",
                          "&:hover": { bgcolor: "#0BA9EF" },
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          setIndustryOpen(false);
                        }}
                      >
                        Done
                      </Button>
                    </ListSubheader>
                  </Select>
                  <FormHelperText>{fieldState.error?.message}</FormHelperText>
                </FormControl>
              )}
            />

            {/* Registered company name */}
            <Controller
              name="registeredCompanyName"
              control={control}
              rules={{ required: "Registered company name is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Registered Company Name"
                  variant="standard"
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  InputLabelProps={{ sx: floatingLabelSx }}
                />
              )}
            />

            {/* Company continent/country/state/city */}
            <Controller
              name="continent"
              control={control}
              rules={{ required: "Continent is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Company Continent"
                  variant="standard"
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  InputLabelProps={{ sx: floatingLabelSx }}
                  sx={{ "& .MuiSelect-select": { fontSize: "1.1rem" } }}
                >
                  <MenuItem value="">Select</MenuItem>
                  {CONTINENT_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="companyCountry"
              control={control}
              rules={{ required: "Company country is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Company Country"
                  variant="standard"
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  InputLabelProps={{ sx: floatingLabelSx }}
                  sx={{ "& .MuiInputBase-input": { fontSize: "1.1rem" } }}
                />
              )}
            />

            <Controller
              name="companyState"
              control={control}
              rules={{ required: "Company state is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Company State"
                  variant="standard"
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  InputLabelProps={{ sx: floatingLabelSx }}
                />
              )}
            />

            <Controller
              name="companyCity"
              control={control}
              rules={{ required: "Company city is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Company City"
                  variant="standard"
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  InputLabelProps={{ sx: floatingLabelSx }}
                />
              )}
            />

            {/* Website */}
            <Controller
              name="websiteUrl"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Website URL"
                  variant="standard"
                  InputLabelProps={{ sx: floatingLabelSx }}
                />
              )}
            />

            {/* Proof document — used by our team to verify the business */}
            <div className="md:col-span-2">
              <p className="font-semibold mb-2">Proof Document</p>
              <p className="text-sm text-gray-600 mb-2">
                Upload a business registration certificate, ownership proof,
                or similar document — this is what our team verifies your
                request against.
              </p>
              <Controller
                name="proofDocument"
                control={control}
                rules={{ required: "A proof document is required" }}
                render={({ field, fieldState }) => (
                  <>
                    <React.Suspense fallback={null}>
                      <UploadFileInput
                        id="proofDocument"
                        label="Upload Proof Document"
                        value={field.value}
                        onChange={field.onChange}
                        showPreview={false}
                      />
                    </React.Suspense>
                    {fieldState.error && (
                      <p className="text-xs text-red-600 mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            {/* Pricing tier */}
            <div className="md:col-span-2 mt-4">
              <p className="font-semibold mb-2">Choose a Verification Plan</p>
              <Controller
                name="requestedTier"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {TIER_OPTIONS.map((tier) => (
                      <button
                        type="button"
                        key={tier.value}
                        onClick={() => field.onChange(tier.value)}
                        className={`border rounded-lg py-3 px-2 text-center transition-colors ${
                          field.value === tier.value
                            ? "border-primary-blue bg-blue-50"
                            : "border-gray-300"
                        }`}
                      >
                        <div className="font-semibold">${tier.price}</div>
                        <div className="text-xs text-gray-500">
                          {tier.label}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Submit */}
            <div className="md:col-span-2 text-center my-6">
              <Button
                type="submit"
                variant="contained"
                disabled={isPending}
                sx={{
                  bgcolor: "black",
                  borderRadius: 20,
                  px: 10,
                  py: 1,
                  "&:hover": { bgcolor: "#333" },
                }}
              >
                {isPending && (
                  <CircularProgress
                    size={16}
                    sx={{ color: "white", mr: 1 }}
                  />
                )}
                {isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </Box>

          <p className="mt-6">
            Our team will review your request and reach out to confirm
            details and arrange payment before your badge goes live.
          </p>
        </>
      ),
    },

    {
      title: "6. Policy Updates",
      content: (
        <p>
          WoNo reserves the right to update or modify this policy at any
          time. The latest version will always be available on this page.
        </p>
      ),
    },
    {
      title: "7. Contact Us",
      content: (
        <>
          <p>For any questions about business verification, please contact:</p>
          <div className="flex flex-col mt-2">
            <span>
              <a
                href="mailto:response@wono.co"
                className="text-primary-blue underline"
              >
                response@wono.co
              </a>
            </span>
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-10 px-6 md:px-12 lg:px-28 pb-8 md:pb-12 pt-12 text-[#364D59]">
      <Seo path="/verify-business" />
      {/* Header */}
      <div className="flex flex-col items-center relative font-comic uppercase font-bold text-secondary-dark text-2xl md:text-4xl lg:text-5xl leading-tight">
        <div className="relative inline-block text-center">
          <h3>Business Verification</h3>
          <img
            src={blueUnderline}
            alt=""
            className="absolute top-full left-1/2 -translate-x-1/2 w-full h-[40%]"
          />
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {sections.map((section, i) => (
          <div key={i}>
            <div className="flex flex-col gap-4 font-sans">
              <h4 className="font-sans text-lg md:text-xl lg:text-2xl font-semibold">
                {section.title}
              </h4>
              <div className="text-content mb-2 mt-2">{section.content}</div>
            </div>
            {i < sections.length - 1 && <hr className="border-gray-300" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerifyBusiness;
