import React, { useEffect, useState } from "react";
import { TextField, Button, Avatar } from "@mui/material";
import useAuth from "../hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import useLogout from "../hooks/useLogout";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Favorites from "./Favorites";
import Reviews from "./Reviews";
import { CircularProgress } from "@mui/material";
import { showErrorAlert, showSuccessAlert } from "../utils/alerts";

const Profile = () => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const logout = useLogout();

  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  const user = auth?.user || {};
  const userId = auth?.user?._id || auth?.user?.id;

  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    country: user?.country || "",
    state: user?.state || "",
    mobile: user?.mobile || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!auth?.user) navigate("/login", { replace: true });
  }, [auth, navigate]);

  useEffect(() => {
    const tab = searchParams.get("tab") || "profile";
    setActiveTab(tab);
  }, [searchParams]);

  const handleLogout = async () => {
    if (isLogoutLoading) return;
    setIsLogoutLoading(true);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      showErrorAlert("Logout failed");
    } finally {
      setIsLogoutLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

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
        queryKey: ["userProfile", data.user._id],
      });
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

  return (
    <div className="bg-[#f8f9fc] min-h-screen p-4 sm:p-6 font-sans text-[#364D59]">
      {/* Tabs - Desktop style preserved, stacks on very small screens */}
      <div className="flex flex-col sm:flex-row mb-6 border rounded-lg overflow-hidden max-w-3xl mx-auto">
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
          className={`flex-1 py-3 font-semibold ${
            activeTab === "reviews"
              ? "bg-[#ff5757] text-white"
              : "bg-white text-[#ff5757]"
          }`}
          onClick={() => handleTabChange("reviews")}
        >
          Reviews
        </button>
      </div>

      {/* PROFILE TAB - Desktop layout preserved, responsive adjustments */}
      {activeTab === "profile" && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm max-w-5xl mx-auto">
          <h2 className="text-lg sm:text-xl font-bold text-[#ff5757] mb-4">MY PROFILE</h2>

          {/* Profile Header - Stacks on mobile, side-by-side on desktop */}
          <div className="flex flex-col md:flex-row items-center justify-between border p-4 rounded-lg gap-4 md:gap-0">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
              <Avatar
                sx={{
                  bgcolor: "#ff5757",
                  width: 80,
                  height: 80,
                  fontSize: "2rem",
                }}
              >
                {user?.firstName ? user.firstName.charAt(0).toUpperCase() : "U"}
              </Avatar>
              <div>
                <h3 className="text-base sm:text-lg font-semibold">
                  {`${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                    "User Name"}
                </h3>
              </div>
            </div>

            <div className="text-sm mt-2 md:mt-0 text-center md:text-left">
              <p>
                <b>Email:</b> {user?.email || "N/A"}
              </p>
              <p>
                <b>Mobile:</b> {user?.mobile || "N/A"}
              </p>
              <div className="mt-3">
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#ff5757",
                    textTransform: "none",
                    px: 6,
                    "&:hover": { bgcolor: "#fc6b6b" },
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
          </div>

          {/* Personal Info - Desktop: 3 columns, Tablet: 2 columns, Mobile: 1 column */}
          <div className="mt-6 border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <TextField
                label="First Name"
                size="small"
                fullWidth
                name="firstName"
                value={profileForm.firstName}
                onChange={handleProfileChange}
                InputProps={{ readOnly: !editMode }}
              />
              <TextField
                label="Last Name"
                size="small"
                fullWidth
                name="lastName"
                value={profileForm.lastName}
                onChange={handleProfileChange}
                InputProps={{ readOnly: !editMode }}
              />
              <TextField
                label="Mobile"
                size="small"
                fullWidth
                name="mobile"
                value={profileForm.mobile}
                onChange={handleProfileChange}
                InputProps={{ readOnly: !editMode }}
              />
            </div>

            <div className="text-center mt-6">
              {editMode ? (
                <>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: "#ff5757",
                      textTransform: "none",
                      px: 6,
                      mr: 2,
                      "&:hover": { bgcolor: "#fc6b6b" },
                    }}
                    onClick={() =>
                      updateProfile({ userId, profileData: profileForm })
                    }
                    disabled={isUpdatePending}
                  >
                    {isUpdatePending ? "Saving..." : "Save"}
                  </Button>

                  <Button
                    variant="outlined"
                    sx={{
                      textTransform: "none",
                      px: 6,
                      color: "#fc6b6b",
                      borderColor: "#fc6b6b",
                    }}
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#ff5757",
                    textTransform: "none",
                    px: 6,
                    "&:hover": { bgcolor: "#fc6b6b" },
                  }}
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
        <div className="bg-white py-6 px-4 sm:px-8 md:px-16 lg:px-32 rounded-lg shadow-sm max-w-3xl mx-auto">
          <h2 className="text-lg sm:text-xl text-center font-bold text-[#ff5757] mb-4">
            CHANGE PASSWORD
          </h2>
          <div className="grid gap-4 mb-3">
            <TextField
              label="Current Password"
              type="password"
              fullWidth
              size="small"
              name="oldPassword"
              value={passwordForm.oldPassword}
              onChange={handlePasswordChange}
            />
            <TextField
              label="New Password"
              type="password"
              fullWidth
              size="small"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
            />
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              size="small"
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
              sx={{
                bgcolor: "#ff5757",
                borderRadius: 9999,
                paddingX: 5,
                textTransform: "none",
                "&:hover": { bgcolor: "#fc6b6b" },
              }}
              onClick={handlePasswordSubmit}
              disabled={isPasswordPending}
            >
              {isPasswordPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      )}

      {/* FAVORITES TAB */}
      {activeTab === "favorites" && <Favorites />}
      {activeTab === "reviews" && <Reviews />}
    </div>
  );
};

export default Profile;