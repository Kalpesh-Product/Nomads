import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import useAuth from "../hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import useLogout from "../hooks/useLogout";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Favorites from "./Favorites";
import Reviews from "./Reviews";
import { CircularProgress } from "@mui/material";
import { showErrorAlert, showSuccessAlert } from "../utils/alerts";
import { Country } from "country-state-city";
import { HiCheck } from "react-icons/hi";
import { FiCalendar, FiHome, FiMapPin, FiUsers } from "react-icons/fi";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import Seo from "../components/Seo";
import Container from "../components/Container";
import MuiModal from "../components/Modal";

const floatingLabelSx = {
  color: "black",
  "&.Mui-focused": { color: "#1976d2" },
  "&.MuiInputLabel-shrink": {
    color: "#1976d2",
  },
};

const primaryPillButtonSx = {
  bgcolor: "black",
  borderRadius: 20,
  px: { xs: 6, md: 14 },
  py: 1.5,
  fontSize: "1rem",
  fontWeight: "600",
  textTransform: "none",
  "&:hover": { bgcolor: "#333" },
  width: { xs: "100%", md: "auto" },
};

const PROFILE_PROMPT =
  "The more details you fill in, the more customized support we can provide.";
const PROFILE_TYPING_SEEN_KEY = "wono-ai-profile-typing-seen";
const getBookingCategoryLabel = (serviceType) => {
  const value = String(serviceType || "").trim();
  const knownLabels = {
    "meeting-room": "Meeting Room",
    "co-living": "Co-living",
    hostel: "Hostel",
  };
  return knownLabels[value] || value.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
};
const DEFAULT_BOOKING_CATEGORY_IMAGES = {
  "meeting-room": "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
  "co-living": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  hostel: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
  default: "https://images.unsplash.com/photo-1501183638710-841dd1904471?w=800&q=80",
};
const getDefaultBookingImage = (serviceType) =>
  DEFAULT_BOOKING_CATEGORY_IMAGES[String(serviceType || "").trim()] || DEFAULT_BOOKING_CATEGORY_IMAGES.default;
const getFlagIconUrl = (isoCode) =>
  `https://flagcdn.com/24x18/${isoCode.toLowerCase()}.png`;
const tickMenuItemSx = {
  "& .tick-icon": { opacity: 0, color: "#1976d2" },
  "&:hover .tick-icon": { opacity: 1 },
  "&.Mui-selected .tick-icon": { opacity: 1 },
  "&.Mui-selected:hover .tick-icon": { opacity: 1 },
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const contactCodeRegex = /^\+\d{1,4}$/;
const fullNameRegex = /^[A-Za-z][A-Za-z .'-]*$/;

const validateProfileForm = (values) => {
  const errors = {};
  const fullName = values.fullName.trim();
  const email = values.email.trim();
  const country = values.country.trim();
  const contactCode = values.contactCode.trim();
  const contactNumber = values.contactNumber.trim();

  if (!fullName) {
    errors.fullName = "Full Name is required";
  } else if (!/[A-Za-z]/.test(fullName)) {
    errors.fullName = "Full Name must include at least one letter";
  } else if (!fullNameRegex.test(fullName)) {
    errors.fullName =
      "Full Name can include letters, spaces, periods, apostrophes, and hyphens";
  }

  if (!email) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(email)) {
    errors.email = "Enter a valid email address";
  }

  if (!country) {
    errors.country = "Current Country Of Residence is required";
  }

  if (!contactCode) {
    errors.contactCode = "Code is required";
  } else if (!contactCodeRegex.test(contactCode)) {
    errors.contactCode = "Enter a valid code";
  }

  if (!contactNumber) {
    errors.contactNumber = "Mobile number is required";
  } else if (!/^\d{6,15}$/.test(contactNumber)) {
    errors.contactNumber = "Enter a valid mobile number";
  } else if (contactCodeRegex.test(contactCode)) {
    const phoneNumber = parsePhoneNumberFromString(
      `${contactCode}${contactNumber}`,
    );

    if (!phoneNumber?.isValid()) {
      errors.contactNumber = "Enter a valid mobile number";
    }
  }

  return errors;
};

const AiProfile = () => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { auth, setAuth } = useAuth();
  const logout = useLogout();

  const user = auth?.user || {};
  const userId = auth?.user?._id || auth?.user?.id;

  const [searchParams] = useSearchParams();
  const setBookingCategoryParam = (categoryId) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", "bookings");
    if (categoryId) params.set("category", categoryId);
    else params.delete("category");
    navigate(`/profile?${params.toString()}`);
  };
  const setBookingViewParam = (view) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", "bookings");
    if (view === "history") params.set("view", "history");
    else params.delete("view");
    navigate(`/profile?${params.toString()}`);
  };
  const countries = useMemo(() => Country.getAllCountries(), []);

  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);
  const seoTab = ["profile", "favorites", "reviews", "password", "bookings"].includes(
    activeTab,
  )
    ? activeTab
    : "profile";
  const [typedProfilePrompt, setTypedProfilePrompt] = useState("");

  const getPhonePrefixByCountryName = (countryName) => {
    const selectedCountry = countries.find((item) => item.name === countryName);
    return selectedCountry?.phonecode ? `+${selectedCountry.phonecode}` : "";
  };

  const initialProfileForm = useMemo(() => {
    const userCountry = user?.country || user?.countryOfResidence || "";
    const selectedCountry = countries.find((item) => item.name === userCountry);

    return {
      fullName: user?.fullName || "",
      email: user?.email || "",
      country: userCountry,
      state: user?.state || "",
      contactCode:
        user?.contactCode ||
        (selectedCountry?.phonecode ? `+${selectedCountry.phonecode}` : ""),
      contactNumber: user?.contactNumber || "",
      salary: user?.salary || "",
      designation: user?.designation || "",
    };
  }, [
    user?.fullName,
    user?.email,
    user?.country,
    user?.countryOfResidence,
    user?.state,
    user?.contactCode,
    user?.contactNumber,
    user?.salary,
    user?.designation,
    countries,
  ]);

  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState(initialProfileForm);
  const [profileErrors, setProfileErrors] = useState({});

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [rescheduleBooking, setRescheduleBooking] = useState(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);
  const [bookingCategory, setBookingCategory] = useState(searchParams.get("category") || "");
  const [bookingHistoryView, setBookingHistoryView] = useState(searchParams.get("view") === "history");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleEndTime, setRescheduleEndTime] = useState("");
  const bookingAccess =
    searchParams.get("booking") ||
    window.localStorage.getItem("wonoWebsiteBookingAccess") ||
    "";
  if (searchParams.get("booking")) {
    window.localStorage.setItem("wonoWebsiteBookingAccess", bookingAccess);
  }
  const {
    data: bookingData,
    isLoading: bookingsLoading,
    error: bookingsError,
  } = useQuery({
    queryKey: ["websiteBookings", userId, bookingAccess],
    queryFn: async () =>
      (
        await axiosPrivate.get(
          `/user/website-bookings?token=${encodeURIComponent(bookingAccess)}`,
        )
      ).data,
    enabled: Boolean(userId) && activeTab === "bookings",
  });
  const { mutate: submitReschedule, isPending: reschedulePending } = useMutation({
    mutationFn: async () => {
      const start = new Date(`${rescheduleDate}T${rescheduleTime}`);
      const end = new Date(`${rescheduleDate}T${rescheduleEndTime}`);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
        throw new Error("Choose a valid start and end time");
      }
      return (
        await axiosPrivate.patch(
          `/user/website-bookings/${rescheduleBooking.id}/reschedule`,
          { start: start.toISOString(), end: end.toISOString() },
        )
      ).data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["websiteBookings", userId] });
      setRescheduleBooking(null);
      showSuccessAlert(data.message || "Booking rescheduled successfully");
    },
    onError: (error) => {
      showErrorAlert(error.response?.data?.message || error.message || "Unable to reschedule booking");
    },
  });
  const selectedStart = rescheduleDate && rescheduleTime
    ? new Date(`${rescheduleDate}T${rescheduleTime}`)
    : null;
  const selectedEnd = rescheduleDate && rescheduleEndTime
    ? new Date(`${rescheduleDate}T${rescheduleEndTime}`)
    : null;
  const selectedRangeValid = Boolean(
    selectedStart &&
    selectedEnd &&
    !Number.isNaN(selectedStart.getTime()) &&
    !Number.isNaN(selectedEnd.getTime()) &&
    selectedEnd > selectedStart,
  );
  const selectedDurationMinutes = selectedRangeValid
    ? Math.round((selectedEnd.getTime() - selectedStart.getTime()) / 60000)
    : 0;
  const {
    data: availabilityData,
    isFetching: availabilityChecking,
    error: availabilityError,
  } = useQuery({
    queryKey: [
      "bookingRescheduleAvailability",
      rescheduleBooking?.id,
      rescheduleDate,
      rescheduleTime,
      rescheduleEndTime,
    ],
    queryFn: async () =>
      (
        await axiosPrivate.post(
          `/user/website-bookings/${rescheduleBooking.id}/reschedule-availability`,
          { start: selectedStart.toISOString(), end: selectedEnd.toISOString() },
        )
      ).data,
    enabled: Boolean(rescheduleBooking?.id) && selectedRangeValid,
    retry: false,
  });
  const knownBookingCategories = [
    { id: "meeting-room", label: "Meeting Room" },
    { id: "co-living", label: "Co-living" },
    { id: "hostel", label: "Hostel" },
  ];
  const websiteBookings = bookingData?.bookings || [];
  const bookingCategories = [
    ...knownBookingCategories,
    ...[...new Set(websiteBookings.map((booking) => String(booking.serviceType || "").trim()).filter(Boolean))]
      .filter((serviceType) => !knownBookingCategories.some((category) => category.id === serviceType))
      .map((id) => ({ id, label: getBookingCategoryLabel(id) })),
  ];
  const isPastBooking = (booking) => {
    const status = String(booking.status || "confirmed").toLowerCase();
    if (["cancelled", "completed"].includes(status)) return true;
    const end = new Date(booking.end);
    return !Number.isNaN(end.getTime()) && end < new Date();
  };
  const scopedWebsiteBookings = websiteBookings.filter((booking) =>
    bookingHistoryView ? isPastBooking(booking) : !isPastBooking(booking),
  );
  const visibleWebsiteBookings = bookingCategory
    ? scopedWebsiteBookings.filter((booking) => booking.serviceType === bookingCategory)
    : scopedWebsiteBookings;

  useEffect(() => {
    if (!auth?.user) navigate("/login", { replace: true });
  }, [auth, navigate]);

  useEffect(() => {
    const tab = searchParams.get("tab") || "profile";
    setActiveTab(tab);
    setBookingCategory(searchParams.get("category") || "");
    setBookingHistoryView(searchParams.get("view") === "history");
  }, [searchParams]);

  useEffect(() => {
    setProfileForm(initialProfileForm);
    setProfileErrors({});
  }, [initialProfileForm]);

  useEffect(() => {
    const hasSeenTypingEffect =
      typeof window !== "undefined" &&
      window.localStorage.getItem(PROFILE_TYPING_SEEN_KEY) === "true";

    if (hasSeenTypingEffect) {
      setTypedProfilePrompt(PROFILE_PROMPT);
      return;
    }

    setTypedProfilePrompt("");

    let index = 0;
    const typingInterval = setInterval(() => {
      index += 1;
      setTypedProfilePrompt(PROFILE_PROMPT.slice(0, index));

      if (index >= PROFILE_PROMPT.length) {
        clearInterval(typingInterval);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(PROFILE_TYPING_SEEN_KEY, "true");
        }
      }
    }, 1);

    return () => clearInterval(typingInterval);
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setProfileErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCountryChange = (countryName) => {
    setProfileForm((prev) => ({
      ...prev,
      country: countryName,
      contactCode: getPhonePrefixByCountryName(countryName),
    }));
    setProfileErrors((prev) => ({
      ...prev,
      country: "",
      contactCode: "",
      contactNumber: "",
    }));
  };

  const selectedCountryData = useMemo(
    () => countries.find((country) => country.name === profileForm.country) || null,
    [countries, profileForm.country],
  );

  const { mutate: updateProfile, isPending: isUpdatePending } = useMutation({
    mutationKey: ["updateProfile"],
    mutationFn: async ({ userId, profileData }) => {
      const response = await axiosPrivate.patch(
        `/user/profile/${userId}`,
        profileData,
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["userProfile", data.user.id || data.user._id],
      });
      setAuth((prev) => ({ ...prev, user: data.user }));
      showSuccessAlert(data.message || "Profile updated successfully");
      setEditMode(false);
    },
    onError: (error) => {
      showErrorAlert(
        error.response?.data?.message || "Failed to update profile",
      );
    },
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const { mutate: changePassword, isPending: isPasswordPending } = useMutation({
    mutationKey: ["changePassword"],
    mutationFn: async ({
      userId,
      oldPassword,
      newPassword,
      confirmPassword,
    }) => {
      const response = await axiosPrivate.patch(`/user/password/${userId}`, {
        oldPassword,
        newPassword,
        confirmPassword,
      });
      return response.data;
    },
    onSuccess: async (data) => {
      showSuccessAlert(data.message || "Password changed successfully");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      await logout();
      navigate("/login", { replace: true });
    },
    onError: (error) => {
      showErrorAlert(
        error.response?.data?.message || "Failed to change password",
      );
    },
  });

  const handlePasswordSubmit = () => {
    const { oldPassword, newPassword, confirmPassword } = passwordForm;
    if (!oldPassword || !newPassword || !confirmPassword)
      return showErrorAlert("All fields are required");
    if (newPassword !== confirmPassword)
      return showErrorAlert("New passwords do not match");
    changePassword({ userId, oldPassword, newPassword, confirmPassword });
  };

  const handleProfileSubmit = () => {
    const errors = validateProfileForm(profileForm);
    setProfileErrors(errors);

    if (Object.keys(errors).length > 0) {
      return showErrorAlert(Object.values(errors)[0]);
    }

    updateProfile({
      userId,
      profileData: {
        ...profileForm,
        fullName: profileForm.fullName.trim(),
        email: profileForm.email.trim(),
        country: profileForm.country.trim(),
        contactCode: profileForm.contactCode.trim(),
        contactNumber: profileForm.contactNumber.trim(),
      },
    });
  };

  return (
    <div className="bg-white min-h-screen p-4 sm:p-6 font-sans text-[#364D59]">
      <Seo path={`/profile?tab=${seoTab}`} fallbackPath="/profile?tab=profile" />
      {/* Tabs - Desktop style preserved, stacks on very small screens */}
      {/* <div className="flex flex-col sm:flex-row mb-6 border rounded-lg overflow-hidden max-w-3xl mx-auto">
                <button
                    className={`flex-1 py-3 font-semibold text-sm sm:text-base ${activeTab === "profile"
                        ? "bg-[#ff5757] text-white"
                        : "bg-white text-[#ff5757]"
                        }`}
                    onClick={() => handleTabChange("profile")}
                >
                    Profile
                </button>
                <button
                    className={`flex-1 py-3 font-semibold text-sm sm:text-base border-t sm:border-t-0 sm:border-l ${activeTab === "password"
                        ? "bg-[#ff5757] text-white"
                        : "bg-white text-[#ff5757]"
                        }`}
                    onClick={() => handleTabChange("password")}
                >
                    Change Password
                </button>
                <button
                    className={`flex-1 py-3 font-semibold text-sm sm:text-base border-t sm:border-t-0 sm:border-l ${activeTab === "favorites"
                        ? "bg-[#ff5757] text-white"
                        : "bg-white text-[#ff5757]"
                        }`}
                    onClick={() => handleTabChange("favorites")}
                >
                    Favorites
                </button>
                <button
                    className={`flex-1 py-3 font-semibold ${activeTab === "reviews"
                        ? "bg-[#ff5757] text-white"
                        : "bg-white text-[#ff5757]"
                        }`}
                    onClick={() => handleTabChange("reviews")}
                >
                    Reviews
                </button>
            </div> */}

      {/* PROFILE TAB - Desktop layout preserved, responsive adjustments */}
      {activeTab === "profile" && (
        <div className="bg-white py-8 px-4 sm:px-8 md:px-16 lg:px-24 max-w-4xl mx-auto">
          <p className="min-h-[3rem] w-full text-center font-play text-[0.95rem] leading-relaxed text-gray-800 sm:text-[1rem] ">
            {typedProfilePrompt}
          </p>
          <h2 className="text-hero min-h-[3rem] text-center font-play text-black mb-6">
            My Profile
          </h2>

          {/* Profile Header - Stacks on mobile, side-by-side on desktop */}
          {/* <div className="flex flex-col md:flex-row items-center justify-between border p-4 rounded-lg gap-4 md:gap-0">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
              <Avatar
                sx={{
                  bgcolor: "#00AEEF",
                  width: 80,
                  height: 80,
                  fontSize: "2rem",
                }}
              >
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
              </Avatar>
              <div>
                <h3 className="text-base sm:text-lg font-semibold">
                  {user?.fullName || "User Name"}
                </h3>
              </div>
            </div>

            <div className="text-sm mt-2 md:mt-0 text-center md:text-left">
              <p>
                <b>Email:</b> {user?.email || "N/A"}
              </p>
              <p>
                <b>Mobile:</b> {user?.contactNumber || "N/A"}
              </p>
              <div className="mt-3">
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#00AEEF",
                    textTransform: "none",
                    px: 6,
                    "&:hover": { bgcolor: "#00AEEF" },
                  }}
                  onClick={handleLogout}
                  disabled={isLogoutLoading}
                >
                  {isLogoutLoading ? (
                    <CircularProgress size={22} sx={{ color: "white" }} />
                  ) : (
                    "Logout"
                  )}
                </Button>
              </div>
            </div>
          </div> */}

          {/* Personal Info - Desktop: 3 columns, Tablet: 2 columns, Mobile: 1 column */}
          <div className="mt-6 py-4">
            <h3 className="font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              <TextField
                label="Full Name"
                variant="standard"
                fullWidth
                name="fullName"
                value={profileForm.fullName}
                onChange={handleProfileChange}
                error={!!profileErrors.fullName}
                helperText={profileErrors.fullName}
                disabled={!editMode}
                InputProps={{ readOnly: !editMode }}
                InputLabelProps={{ sx: floatingLabelSx }}
              />
              <TextField
                label="Email"
                variant="standard"
                fullWidth
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                error={!!profileErrors.email}
                helperText={profileErrors.email}
                disabled={!editMode}
                InputProps={{ readOnly: !editMode }}
                InputLabelProps={{ sx: floatingLabelSx }}
              />
              <TextField
                label="Current Country Of Residence"
                variant="standard"
                fullWidth
                select
                name="country"
                value={profileForm.country}
                onChange={(event) => handleCountryChange(event.target.value)}
                error={!!profileErrors.country}
                helperText={profileErrors.country}
                disabled={!editMode}
                InputLabelProps={{ sx: floatingLabelSx }}
                SelectProps={{
                  renderValue: (value) => {
                    const selectedOption = countries.find(
                      (country) => country.name === value,
                    );

                    if (!selectedOption) {
                      return value;
                    }

                    return (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <img
                          src={getFlagIconUrl(selectedOption.isoCode)}
                          alt={`${selectedOption.name} flag`}
                          width={20}
                          height={15}
                          loading="lazy"
                        />
                        <span>{selectedOption.name}</span>
                      </Box>
                    );
                  },
                }}
              >
                <MenuItem value="" sx={{ fontWeight: 700 }}>
                  SELECT COUNTRY
                </MenuItem>
                {countries.map((country) => (
                  <MenuItem
                    key={country.isoCode}
                    value={country.name}
                    sx={tickMenuItemSx}
                  >
                    <Box className="flex w-full items-center gap-2">
                      <HiCheck className="tick-icon" size={16} />
                      <Box className="flex items-center gap-1">
                        <Box
                          component="img"
                          src={getFlagIconUrl(country.isoCode)}
                          alt={`${country.name} flag`}
                          sx={{ width: 20, height: 15, flexShrink: 0 }}
                          loading="lazy"
                        />
                        <span>{country.name}</span>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
              <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
                <TextField
                  label="Code"
                  variant="standard"
                  name="contactCode"
                  value={profileForm.contactCode}
                  error={!!profileErrors.contactCode}
                  helperText={profileErrors.contactCode}
                  disabled={!editMode}
                  InputLabelProps={{ sx: floatingLabelSx }}
                  InputProps={{
                    readOnly: true,
                    startAdornment: selectedCountryData?.isoCode ? (
                      <InputAdornment position="start">
                        <Box
                          component="img"
                          src={getFlagIconUrl(selectedCountryData.isoCode)}
                          alt={`${selectedCountryData.name} flag`}
                          sx={{ width: 20, height: 15, flexShrink: 0 }}
                          loading="lazy"
                        />
                      </InputAdornment>
                    ) : null,
                  }}
                  sx={{ width: "28%" }}
                />
                <TextField
                  label="Mobile"
                  variant="standard"
                  fullWidth
                  name="contactNumber"
                  value={profileForm.contactNumber}
                  onChange={handleProfileChange}
                  error={!!profileErrors.contactNumber}
                  helperText={profileErrors.contactNumber}
                  disabled={!editMode}
                  InputProps={{ readOnly: !editMode }}
                  InputLabelProps={{ sx: floatingLabelSx }}
                  sx={{ flex: 1 }}
                />
              </Box>
              <TextField
                label="Salary"
                variant="standard"
                fullWidth
                name="salary"
                value={profileForm.salary}
                onChange={handleProfileChange}
                disabled={!editMode}
                InputProps={{ readOnly: !editMode }}
                InputLabelProps={{ sx: floatingLabelSx }}
              />
              <TextField
                label="Designation"
                variant="standard"
                fullWidth
                name="designation"
                value={profileForm.designation}
                onChange={handleProfileChange}
                disabled={!editMode}
                InputProps={{ readOnly: !editMode }}
                InputLabelProps={{ sx: floatingLabelSx }}
              />
            </div>

            <div className="text-center mt-6">
              {editMode ? (
                <>
                  <Button
                    variant="contained"
                    sx={{ ...primaryPillButtonSx, mr: { xs: 0, md: 2 } }}
                    onClick={handleProfileSubmit}
                    disabled={isUpdatePending}
                  >
                    {isUpdatePending ? "Submitting..." : "Submit"}
                  </Button>

                  <Button
                    variant="outlined"
                    sx={{
                      textTransform: "none",
                      px: { xs: 6, md: 14 },
                      py: 1.5,
                      color: "black",
                      borderColor: "black",
                      borderRadius: 20,
                      mt: { xs: 2, md: 0 },
                      width: { xs: "100%", md: "auto" },
                    }}
                    onClick={() => {
                      setProfileForm(initialProfileForm);
                      setProfileErrors({});
                      setEditMode(false);
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  sx={primaryPillButtonSx}
                  onClick={() => setEditMode(true)}
                >
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD TAB - Desktop style preserved, responsive padding */}
      {activeTab === "password" && (
        <div className="bg-white py-8 px-4 sm:px-8 md:px-16 lg:px-24 max-w-4xl mx-auto">
          <h2 className="text-hero min-h-[3rem] text-center font-play text-black mb-6">
            Change Password
          </h2>
          <div className="grid gap-4 mb-3">
            <TextField
              label="Current Password"
              type="password"
              fullWidth
              variant="standard"
              name="oldPassword"
              value={passwordForm.oldPassword}
              onChange={handlePasswordChange}
            />
            <TextField
              label="New Password"
              type="password"
              fullWidth
              variant="standard"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
            />
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              variant="standard"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
            />
          </div>

          <div className="text-sm text-gray-700 mb-4">
            <p className="font-semibold">Password Requirements</p>
            <ul className="list-disc ml-5">
              <li>Must be at least 8 characters long.</li>
              <li>Should include both uppercase and lowercase letters.</li>
              <li>Must contain at least one number or special character.</li>
            </ul>
          </div>
          <div className="flex justify-center items-center">
            <Button
              variant="contained"
              sx={primaryPillButtonSx}
              onClick={handlePasswordSubmit}
              disabled={isPasswordPending}
            >
              {isPasswordPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      )}

      {/* FAVORITES TAB */}
      {activeTab === "favorites" && (
        <Favorites
          showDestinationFavorites
          useAiListingsRoute
          showRemoveFavoriteIcons
        />
      )}
      {activeTab === "reviews" && <Reviews />}
      {activeTab === "bookings" && (
        <Container padding={false}>
        <div className="min-h-screen rounded-xl bg-white p-6">
          <h1 className="mb-6 text-xl font-semibold text-secondary-dark">My Bookings</h1>
                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  <button
                    type="button"
                    onClick={() => setBookingCategoryParam("")}
                    className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${!bookingCategory ? "border-secondary-dark ring-1 ring-secondary-dark" : "border-gray-200 hover:border-gray-400"}`}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">All</p>
                    <p className="mt-2 text-2xl font-bold text-secondary-dark">{scopedWebsiteBookings.length}</p>
                    <p className="text-xs text-gray-500">{scopedWebsiteBookings.length === 1 ? "booking" : "bookings"}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                      <span className="text-[10px] uppercase text-gray-400">Every category</span>
                      <span className="text-xs font-semibold text-primary-blue">View bookings →</span>
                    </div>
                  </button>
                  {bookingCategories.map((category) => {
                    const count = scopedWebsiteBookings.filter((booking) => booking.serviceType === category.id).length;
                    const isActive = bookingCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setBookingCategoryParam(category.id)}
                        className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${isActive ? "border-secondary-dark ring-1 ring-secondary-dark" : "border-gray-200 hover:border-gray-400"}`}
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">{category.label}</p>
                        <p className="mt-2 text-2xl font-bold text-secondary-dark">{count}</p>
                        <p className="text-xs text-gray-500">{count === 1 ? "booking" : "bookings"}</p>
                        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                          <span className="text-[10px] uppercase text-gray-400">{category.label}</span>
                          <span className="text-xs font-semibold text-primary-blue">View bookings →</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-secondary-dark">
              All {bookingHistoryView ? "Past" : "Upcoming"}{bookingCategory ? ` ${bookingCategories.find((category) => category.id === bookingCategory)?.label}` : ""} Bookings
            </h2>
            <button
              type="button"
              onClick={() => setBookingViewParam(bookingHistoryView ? "" : "history")}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${bookingHistoryView ? "border-secondary-dark bg-secondary-dark text-white" : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"}`}
            >
              {bookingHistoryView ? "Back to Upcoming" : "History"}
            </button>
          </div>
          {bookingsLoading && (
            <div className="flex justify-center"><CircularProgress size={28} /></div>
          )}
          {bookingsError && (
            <p className="text-center text-red-600">
              {bookingsError.response?.data?.message || "Unable to load bookings."}
            </p>
          )}
          {!bookingsLoading && !bookingsError && !visibleWebsiteBookings.length && (
            <p className="text-center text-gray-600">
              {bookingCategory
                ? `No ${bookingHistoryView ? "past" : "upcoming"} ${bookingCategories.find((category) => category.id === bookingCategory)?.label || ""} bookings found.`
                : bookingHistoryView
                  ? "No past bookings yet."
                  : `No upcoming bookings were found for ${user?.email || "this account"}.`}
            </p>
          )}
          {!bookingsLoading && !bookingsError && visibleWebsiteBookings.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                {visibleWebsiteBookings.map((booking) => {
              const start = new Date(booking.start);
              const end = new Date(booking.end);
              const normalizedStatus = String(booking.status || "confirmed").toLowerCase();
              const isStayBooking = booking.serviceType === "hostel" || booking.serviceType === "co-living";
              return (
                <article
                  key={booking.id}
                  className="flex w-full flex-col gap-2 rounded-lg bg-white text-left transition-all"
                >
                  <button
                    type="button"
                    className="group relative aspect-square w-full overflow-hidden rounded-3xl bg-white"
                    onClick={() => setSelectedBookingDetail(booking)}
                  >
                    <img
                      src={booking.imageUrl || getDefaultBookingImage(booking.serviceType)}
                      alt={booking.hostCompanyName || booking.roomName}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="rounded-full bg-black/60 px-4 py-1.5 text-sm font-semibold text-white">
                        View Details
                      </span>
                    </div>
                    <div className="absolute inset-x-2 bottom-2 flex justify-end">
                      <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-normal text-black">
                      {getBookingCategoryLabel(booking.serviceType)}
                      </span>
                    </div>
                  </button>
                  <div className="flex flex-col gap-1 px-4 pr-1">
                    <p className="truncate text-xs font-semibold md:text-sm" title={booking.hostCompanyName || booking.roomName}>
                      {booking.hostCompanyName || booking.roomName}
                    </p>
                    <div className="flex w-full items-center justify-between gap-2">
                      <p className="truncate text-xs font-medium text-gray-600 md:text-sm" title={booking.roomName}>
                        {booking.roomName}
                      </p>
                      <span className="shrink-0 text-xs font-medium capitalize text-gray-600 md:text-sm">{normalizedStatus}</span>
                    </div>
                    <p className="truncate text-xs text-gray-500">
                      {isStayBooking
                        ? `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`
                        : `${start.toLocaleDateString()} · ${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}–${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                    </p>
                  </div>
                </article>
              );
                })}
              </div>
          )}
          <Dialog
            open={Boolean(rescheduleBooking)}
            onClose={() => !reschedulePending && setRescheduleBooking(null)}
            fullWidth
            maxWidth="sm"
            PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
          >
            <DialogTitle sx={{ px: 3, pt: 3, pb: 0.5 }}>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Meeting room booking
              </p>
              <p className="mt-1 text-xl font-semibold text-gray-900 sm:text-2xl">
                Reschedule {rescheduleBooking?.roomName}
              </p>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              {rescheduleBooking && (
                <div className="mb-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Current booking</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">{rescheduleBooking.bookingCode}</p>
                  <p className="mt-0.5 text-sm text-gray-600">
                    {new Date(rescheduleBooking.start).toLocaleDateString()} · {new Date(rescheduleBooking.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – {new Date(rescheduleBooking.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              )}
              <p className="mb-5 text-sm text-gray-600">Choose a new slot. Your paid duration and price remain unchanged.</p>
              <div className="grid gap-4 sm:grid-cols-3">
              <TextField
                label="New date"
                type="date"
                value={rescheduleDate}
                onChange={(event) => setRescheduleDate(event.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().slice(0, 10) }}
                fullWidth
              />
              <TextField
                label="New start time"
                type="time"
                value={rescheduleTime}
                onChange={(event) => setRescheduleTime(event.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="New end time"
                type="time"
                value={rescheduleEndTime}
                onChange={(event) => setRescheduleEndTime(event.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              </div>
              <div className="mt-5 rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-gray-700">Selected duration</span>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-900">
                    {selectedDurationMinutes ? `${selectedDurationMinutes} min` : "—"}
                  </span>
                </div>
                <div className={`mt-3 rounded-xl px-4 py-3 text-sm font-semibold ${
                  availabilityChecking
                    ? "bg-blue-50 text-blue-700"
                    : availabilityData?.available
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-800"
                }`} role="status">
                  {availabilityChecking
                    ? "Checking live availability…"
                    : availabilityError
                      ? availabilityError.response?.data?.message || "Availability could not be checked."
                      : availabilityData?.message || "Select a valid date, start time, and end time."}
                </div>
              </div>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => setRescheduleBooking(null)}
                disabled={reschedulePending}
                sx={{ borderRadius: 999, px: 3, borderColor: "#d1d5db", color: "#374151", "&:hover": { bgcolor: "#f9fafb", borderColor: "#d1d5db" } }}
              >Cancel</Button>
              <Button
                variant="contained"
                onClick={() => submitReschedule()}
                disabled={!availabilityData?.available || availabilityChecking || reschedulePending}
                sx={{ borderRadius: 999, px: 4, bgcolor: "black", "&:hover": { bgcolor: "#333" } }}
              >
                {reschedulePending ? "Checking…" : "Confirm reschedule"}
              </Button>
            </DialogActions>
          </Dialog>

          <MuiModal
            open={Boolean(selectedBookingDetail)}
            onClose={() => setSelectedBookingDetail(null)}
            title={selectedBookingDetail?.bookingCode || "Booking Details"}
          >
            {selectedBookingDetail && (() => {
              const detail = selectedBookingDetail;
              const detailStart = new Date(detail.start);
              const detailEnd = new Date(detail.end);
              const detailIsStay = detail.serviceType === "hostel" || detail.serviceType === "co-living";
              const detailIsPast = isPastBooking(detail);
              const detailStatus = String(detail.status || "confirmed").toLowerCase();
              const detailNights = Math.max(
                1,
                Math.round((detailEnd - detailStart) / (1000 * 60 * 60 * 24)),
              );
              const detailBedLabel = Array.isArray(detail.bedNumbers)
                ? detail.bedNumbers.join(", ")
                : detail.bedNumbers;
              const DetailIcon = detail.serviceType === "meeting-room" ? FiUsers : FiHome;
              const amountFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: detail.currency || "USD" });
              return (
                <div className="flex flex-col gap-6 pb-2">
                  {/* Hero image */}
                  <img
                    src={detail.imageUrl || getDefaultBookingImage(detail.serviceType)}
                    alt={detail.hostCompanyName || detail.roomName}
                    className="h-48 w-full rounded-2xl object-cover sm:h-56"
                  />

                  {/* Header: icon avatar + name + status pills */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fff0f0] text-[#ff5757] sm:h-14 sm:w-14">
                        <DetailIcon size={22} aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xl font-semibold text-gray-900 sm:text-2xl">
                          {detail.hostCompanyName || detail.roomName}
                        </p>
                        <p className="mt-0.5 truncate text-sm text-gray-500" title={detail.roomName}>
                          {detail.roomName && detail.hostCompanyName
                            ? detail.roomName
                            : getBookingCategoryLabel(detail.serviceType)}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                      <span className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
                        {getBookingCategoryLabel(detail.serviceType)}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${
                          detailStatus === "cancelled"
                            ? "border-red-200 bg-red-50 text-red-700"
                            : "border-gray-200 bg-gray-100 text-gray-700"
                        }`}
                      >
                        {detailStatus}
                      </span>
                      {detail.paymentStatus ? (
                        <span
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                            detail.paymentStatus === "Paid"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {detail.paymentStatus}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-col gap-4 border-t border-borderGray pt-5">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                        <FiCalendar size={15} aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          {detailIsStay ? "Stay" : "Schedule"}
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-gray-800">
                          {detailIsStay
                            ? `${detailStart.toLocaleDateString()} – ${detailEnd.toLocaleDateString()}`
                            : `${detailStart.toLocaleDateString()} · ${detailStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}–${detailEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                        </p>
                        {detailIsStay && (
                          <p className="mt-0.5 text-sm text-gray-500">
                            {detailNights} night{detailNights === 1 ? "" : "s"}
                          </p>
                        )}
                      </div>
                    </div>

                    {detail.location && (
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                          <FiMapPin size={15} aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Location</p>
                          <p className="mt-0.5 text-sm font-medium text-gray-800">{detail.location}</p>
                        </div>
                      </div>
                    )}

                    {detail.attendees ? (
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                          <FiUsers size={15} aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Attendees</p>
                          <p className="mt-0.5 text-sm font-medium text-gray-800">
                            {detail.attendees} attendee{detail.attendees === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {detailIsStay && detailBedLabel ? (
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                          <FiHome size={15} aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Beds</p>
                          <p className="mt-0.5 text-sm font-medium text-gray-800">{detailBedLabel}</p>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Amount */}
                  {typeof detail.totalAmount === "number" && (
                    <div className="flex items-center justify-between border-t border-borderGray pt-5">
                      <span className="text-sm font-medium text-gray-500">Amount</span>
                      <span className="text-xl font-semibold text-gray-900">
                        {amountFormatter.format(detail.totalAmount)}
                      </span>
                    </div>
                  )}

                  {/* Footer actions */}
                  <div className="flex flex-col-reverse gap-3 border-t border-borderGray pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedBookingDetail(null)}
                      className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      Close
                    </button>
                    {!detailIsStay && !detailIsPast && (
                      <button
                        type="button"
                        onClick={() => {
                          const current = new Date(detail.start);
                          setRescheduleBooking(detail);
                          setRescheduleDate(current.toISOString().slice(0, 10));
                          setRescheduleTime(current.toTimeString().slice(0, 5));
                          setRescheduleEndTime(new Date(detail.end).toTimeString().slice(0, 5));
                          setSelectedBookingDetail(null);
                        }}
                        className="rounded-full bg-black px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#333]"
                      >
                        Reschedule
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </MuiModal>
        </div>
        </Container>
      )}
    </div>
  );
};

export default AiProfile;
