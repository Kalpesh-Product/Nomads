import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import useAuth from "../hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import useLogout from "../hooks/useLogout";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Favorites from "./Favorites";
import Reviews from "./Reviews";
import { CircularProgress } from "@mui/material";
import { showErrorAlert, showSuccessAlert } from "../utils/alerts";
import { Country } from "country-state-city";
import { HiCheck } from "react-icons/hi";

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
const getFlagIconUrl = (isoCode) =>
  `https://flagcdn.com/24x18/${isoCode.toLowerCase()}.png`;
const tickMenuItemSx = {
  "& .tick-icon": { opacity: 0, color: "#1976d2" },
  "&:hover .tick-icon": { opacity: 1 },
  "&.Mui-selected .tick-icon": { opacity: 1 },
  "&.Mui-selected:hover .tick-icon": { opacity: 1 },
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
  const countries = useMemo(() => Country.getAllCountries(), []);

  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);
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

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!auth?.user) navigate("/ai-login", { replace: true });
  }, [auth, navigate]);

  useEffect(() => {
    const tab = searchParams.get("tab") || "profile";
    setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    setProfileForm(initialProfileForm);
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
  };

  const handleCountryChange = (countryName) => {
    setProfileForm((prev) => ({
      ...prev,
      country: countryName,
      contactCode: getPhonePrefixByCountryName(countryName),
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
      navigate("/ai-login", { replace: true });
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

  return (
    <div className="bg-white min-h-screen p-4 sm:p-6 font-sans text-[#364D59]">
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
                InputProps={{ readOnly: true }}
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
                    onClick={() =>
                      updateProfile({ userId, profileData: profileForm })
                    }
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
        <Favorites showDestinationFavorites useAiListingsRoute />
      )}
      {activeTab === "reviews" && <Reviews />}
    </div>
  );
};

export default AiProfile;
