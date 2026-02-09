import React, { useEffect, useState } from "react";
import { TextField, Button, Avatar } from "@mui/material";
import useAuth from "../hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import useLogout from "../hooks/useLogout";
// import toast from "react-hot-toast";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Favorites from "./Favorites";
import { CircularProgress } from "@mui/material";
import { showErrorAlert, showSuccessAlert } from "../utils/alerts";

const Profile = () => {
  // const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const logout = useLogout();

  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  const user = auth?.user || {};
  const userId = auth?.user?._id || auth?.user?.id;

  const [searchParams, setSearchParams] = useSearchParams();

  // Default tab
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab }); // update URL when switching tabs
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

  // const handleTabChange = (tab) => setActiveTab(tab);

  // users cannot access this page without login
  useEffect(() => {
    if (!auth?.user) navigate("/login", { replace: true });
  }, [auth, navigate]);

  useEffect(() => {
    const tab = searchParams.get("tab") || "profile";
    setActiveTab(tab);
  }, [searchParams]);

  // const handleLogout = async () => {
  //   try {
  //     await logout();
  //     navigate("/login");
  //   } catch (error) {
  //     console.error("Logout failed:", error);
  //   }
  // };

  const handleLogout = async () => {
    if (isLogoutLoading) return; // Prevent double clicks

    setIsLogoutLoading(true);

    try {
      await logout();
      // toast.success("Logged out");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      showErrorAlert("Logout failed");
    } finally {
      setIsLogoutLoading(false);
    }
  };

  // 🔹 Handle profile field changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Update Profile Mutation
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

  // 🔹 Handle password change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Change Password Mutation (using TanStack)
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

      // Clear form
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Force logout immediately
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
    <div className="bg-[#f8f9fc] min-h-screen px-4 md:px-6 py-10 font-sans text-[#364D59]">
      {/* Tabs */}
      <div className="flex flex-col sm:flex-row mb-8 border rounded-lg overflow-hidden max-w-3xl mx-auto bg-white shadow-sm">
        <button
          className={`flex-1 py-3 text-sm md:text-base font-semibold transition-colors ${activeTab === "profile"
            ? "bg-[#ff5757] text-white"
            : "bg-white text-[#ff5757] hover:bg-red-50"
            }`}
          onClick={() => handleTabChange("profile")}
        >
          Profile
        </button>
        <button
          className={`flex-1 py-3 text-sm md:text-base font-semibold border-t sm:border-t-0 sm:border-l transition-colors ${activeTab === "password"
            ? "bg-[#ff5757] text-white"
            : "bg-white text-[#ff5757] hover:bg-red-50"
            }`}
          onClick={() => handleTabChange("password")}
        >
          Change Password
        </button>
        <button
          className={`flex-1 py-3 text-sm md:text-base font-semibold border-t sm:border-t-0 sm:border-l transition-colors ${activeTab === "favorites"
            ? "bg-[#ff5757] text-white"
            : "bg-white text-[#ff5757] hover:bg-red-50"
            }`}
          onClick={() => handleTabChange("favorites")}
        >
          Favorites
        </button>
      </div>

      {/* PROFILE TAB */}
      {activeTab === "profile" && (
        <div className="bg-white p-6 rounded-lg shadow-sm max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-[#ff5757] mb-4">MY PROFILE</h2>

          <div className="flex flex-col lg:flex-row items-center justify-between border-b pb-8 mb-8 gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <Avatar
                sx={{
                  bgcolor: "#ff5757",
                  width: { xs: 80, md: 100 },
                  height: { xs: 80, md: 100 },
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              >
                {user?.firstName ? user.firstName.charAt(0).toUpperCase() : "U"}
              </Avatar>
              <div className="flex flex-col">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                  {`${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                    "User Name"}
                </h3>
                <div className="flex flex-col gap-1 mt-2 text-sm text-gray-600">
                  <p>
                    <span className="font-semibold text-gray-800">Email:</span>{" "}
                    {user?.email || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">Mobile:</span>{" "}
                    {user?.mobile || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="contained"
              sx={{
                bgcolor: "#ff5757",
                textTransform: "none",
                px: 6,
                py: 1,
                borderRadius: "8px",
                fontWeight: "600",
                width: { xs: "100%", sm: "auto" },
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

          {/* Personal Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800 border-l-4 border-[#ff5757] pl-3">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TextField
                label="First Name"
                fullWidth
                name="firstName"
                value={profileForm.firstName}
                onChange={handleProfileChange}
                InputProps={{ readOnly: !editMode }}
                variant={editMode ? "outlined" : "filled"}
              />
              <TextField
                label="Last Name"
                fullWidth
                name="lastName"
                value={profileForm.lastName}
                onChange={handleProfileChange}
                InputProps={{ readOnly: !editMode }}
                variant={editMode ? "outlined" : "filled"}
              />
              <TextField
                label="Mobile"
                fullWidth
                name="mobile"
                value={profileForm.mobile}
                onChange={handleProfileChange}
                InputProps={{ readOnly: !editMode }}
                variant={editMode ? "outlined" : "filled"}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-center mt-8 gap-4">
              {editMode ? (
                <>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: "#ff5757",
                      textTransform: "none",
                      px: 8,
                      py: 1,
                      borderRadius: "8px",
                      fontWeight: "600",
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
                      px: 8,
                      py: 1,
                      borderRadius: "8px",
                      fontWeight: "600",
                      color: "#fc6b6b",
                      borderColor: "#fc6b6b",
                      "&:hover": { borderColor: "#fc6b6b", bgcolor: "red.50" },
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
                    px: 10,
                    py: 1,
                    borderRadius: "8px",
                    fontWeight: "600",
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

      {/* CHANGE PASSWORD TAB */}
      {activeTab === "password" && (
        <div className="bg-white py-8 px-6 md:px-16 lg:px-24 rounded-lg shadow-sm max-w-3xl mx-auto">
          <h2 className="text-xl text-center font-bold text-[#ff5757] mb-8 uppercase tracking-wide">
            Change Password
          </h2>
          <div className="flex flex-col gap-6 mb-8">
            <TextField
              label="Current Password"
              type="password"
              fullWidth
              name="oldPassword"
              value={passwordForm.oldPassword}
              onChange={handlePasswordChange}
              variant="outlined"
            />
            <TextField
              label="New Password"
              type="password"
              fullWidth
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              variant="outlined"
            />
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              variant="outlined"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 mb-8 border-l-4 border-amber-400">
            <p className="font-bold mb-2 text-gray-800">Password Requirements</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Must be at least 8 characters long.</li>
              <li>Should include both uppercase and lowercase letters.</li>
              <li>Must contain at least one number or special character.</li>
            </ul>
          </div>

          <div className="flex justify-center">
            <Button
              variant="contained"
              sx={{
                bgcolor: "#ff5757",
                borderRadius: "8px",
                px: 10,
                py: 1.5,
                fontWeight: "600",
                textTransform: "none",
                width: { xs: "100%", sm: "auto" },
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
    </div>
  );
};

export default Profile;
