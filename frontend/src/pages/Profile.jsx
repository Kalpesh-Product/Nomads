import React, { useState } from "react";
import { TextField, Button, Avatar } from "@mui/material";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import useLogout from "../hooks/useLogout";
import axiosInstance from "../utils/axios";
import toast from "react-hot-toast";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();
  console.log("auth.user:", auth?.user);
  const logout = useLogout();
  const user = auth?.user || {};
  const userId = auth?.user?._id || auth?.user?.id;

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

  const handleTabChange = (tab) => setActiveTab(tab);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // 🔹 Handle profile field changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Save profile updates
  const handleProfileSave = async () => {
    try {
      const res = await axiosInstance.patch(
        `/user/profile/${userId}`,
        profileForm
      );
      toast.success("Profile updated successfully");
      setAuth((prev) => ({
        ...prev,
        user: { ...prev.user, ...res.data.user },
      }));
      setEditMode(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  // 🔹 Handle password change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    if (!oldPassword || !newPassword || !confirmPassword)
      return toast.error("All fields are required");

    if (newPassword !== confirmPassword)
      return toast.error("New passwords do not match");

    try {
      const res = await axiosInstance.patch(`/user/password/${userId}`, {
        oldPassword,
        newPassword,
      });
      toast.success(res.data.message || "Password changed successfully");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <div className="bg-[#f8f9fc] min-h-screen p-6 font-sans text-[#364D59]">
      {/* Tabs */}
      <div className="flex mb-6 border rounded-lg overflow-hidden max-w-3xl mx-auto">
        <button
          className={`flex-1 py-3 font-semibold ${
            activeTab === "profile"
              ? "bg-[#ff5757] text-white"
              : "bg-white text-[#ff5757]"
          }`}
          onClick={() => handleTabChange("profile")}
        >
          Profile
        </button>
        <button
          className={`flex-1 py-3 font-semibold ${
            activeTab === "password"
              ? "bg-[#ff5757] text-white"
              : "bg-white text-[#ff5757]"
          }`}
          onClick={() => handleTabChange("password")}
        >
          Change Password
        </button>
      </div>

      {/* PROFILE TAB */}
      {activeTab === "profile" && (
        <div className="bg-white p-6 rounded-lg shadow-sm max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-[#ff5757] mb-4">MY PROFILE</h2>

          <div className="flex flex-col md:flex-row items-center justify-between border p-4 rounded-lg">
            <div className="flex items-center gap-6">
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
                <h3 className="text-lg font-semibold">
                  {`${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                    "User Name"}
                </h3>
                <p className="text-sm text-gray-600">
                  {user?.country || "N/A"}
                </p>
              </div>
            </div>

            <div className="text-sm mt-4 md:mt-0">
              <p>
                <b>Email:</b> {user?.email || "N/A"}
              </p>
              <p>
                <b>Mobile:</b> {user?.mobile || "N/A"}
              </p>
              <br />
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#ff5757",
                  textTransform: "none",
                  px: 6,
                  "&:hover": { bgcolor: "#1a3b8a" },
                }}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>

          {/* Personal Info */}
          <div className="mt-6 border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Personal Information</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <TextField
                label="First Name"
                size="small"
                name="firstName"
                value={profileForm.firstName}
                onChange={handleProfileChange}
                InputProps={{ readOnly: !editMode }}
              />
              <TextField
                label="Last Name"
                size="small"
                name="lastName"
                value={profileForm.lastName}
                onChange={handleProfileChange}
                InputProps={{ readOnly: !editMode }}
              />
              <TextField
                label="Mobile"
                size="small"
                name="mobile"
                value={profileForm.mobile}
                onChange={handleProfileChange}
                InputProps={{ readOnly: !editMode }}
              />
              <TextField
                label="Country"
                size="small"
                name="country"
                value={profileForm.country}
                onChange={handleProfileChange}
                InputProps={{ readOnly: !editMode }}
              />
              <TextField
                label="State"
                size="small"
                name="state"
                value={profileForm.state}
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
                      "&:hover": { bgcolor: "#1a3b8a" },
                    }}
                    onClick={handleProfileSave}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      textTransform: "none",
                      px: 6,
                      color: "#364D59",
                      borderColor: "#364D59",
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
                    "&:hover": { bgcolor: "#1a3b8a" },
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
        <div className="bg-white p-6 rounded-lg shadow-sm max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-[#ff5757] mb-4">
            CHANGE PASSWORD
          </h2>
          <div className="grid md:grid-cols-2 gap-4 mb-3">
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

          <Button
            variant="contained"
            sx={{
              bgcolor: "#ff5757",
              textTransform: "none",
              "&:hover": { bgcolor: "#1a3b8a" },
            }}
            onClick={handlePasswordSubmit}
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  );
};

export default Profile;
