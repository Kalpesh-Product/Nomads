import React, { useState } from "react";
import { TextField, Button, Avatar } from "@mui/material";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import useLogout from "../hooks/useLogout";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();
  const { auth } = useAuth();
  const logout = useLogout();

  const handleTabChange = (tab) => setActiveTab(tab);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const user = auth?.user || {};

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
          onClick={() => handleTabChange("profile")}>
          Profile
        </button>
        <button
          className={`flex-1 py-3 font-semibold ${
            activeTab === "password"
              ? "bg-[#ff5757] text-white"
              : "bg-white text-[#ff5757]"
          }`}
          onClick={() => handleTabChange("password")}>
          Change Password
        </button>
        <button
          className={`flex-1 py-3 font-semibold ${
            activeTab === "saves"
              ? "bg-[#ff5757] text-white"
              : "bg-white text-[#ff5757]"
          }`}
          onClick={() => handleTabChange("saves")}>
          My Saves
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
                }}>
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
                onClick={handleLogout}>
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
                value={user?.firstName || ""}
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Last Name"
                size="small"
                value={user?.lastName || ""}
                InputProps={{ readOnly: true }}
              />
              {/* <TextField
                label="Email"
                size="small"
                value={user?.email || ""}
                InputProps={{ readOnly: true }}
              /> */}
              <TextField
                label="Mobile"
                size="small"
                value={user?.mobile || ""}
                InputProps={{ readOnly: true }}
              />
              {/* <TextField
                label="Country"
                size="small"
                value={user?.country || ""}
                InputProps={{ readOnly: true }}
              /> */}
            </div>

            <div className="text-center mt-6">
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#ff5757",
                  textTransform: "none",
                  px: 6,
                  "&:hover": { bgcolor: "#1a3b8a" },
                }}>
                Edit
              </Button>
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
            <div className="flex items-center gap-2">
              <TextField
                label="Current Password"
                type="password"
                fullWidth
                size="small"
              />
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#9ca3af",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#6b7280" },
                }}>
                Verify
              </Button>
            </div>
            <TextField
              label="New Password"
              type="password"
              fullWidth
              size="small"
            />
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              size="small"
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
              bgcolor: "#9ca3af",
              textTransform: "none",
              "&:hover": { bgcolor: "#6b7280" },
            }}>
            Submit
          </Button>
        </div>
      )}

      {/* MY SAVES TAB */}
      {activeTab === "saves" && (
        <div className="bg-white p-6 rounded-lg shadow-sm max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-[#ff5757] mb-6">MY SAVES</h2>
          <h3 className="text-lg font-semibold mb-3">Saved Listings</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {[
              {
                name: "BIZ Nest",
                location: "Panjim, Goa",
                rating: 4.8,
                img: "/images/cowork1.jpg",
              },
              {
                name: "MeWo",
                location: "Panjim, Goa",
                rating: 4.8,
                img: "/images/cowork2.jpg",
              },
              {
                name: "SMVV Desk",
                location: "Panjim, Goa",
                rating: 5.0,
                img: "/images/cowork3.jpg",
              },
              {
                name: "Fiire - Nehrunagar",
                location: "Margao, Goa",
                rating: 4.9,
                img: "/images/cowork4.jpg",
              },
            ].map((space, idx) => (
              <div
                key={idx}
                className="rounded-lg overflow-hidden border hover:shadow-md transition">
                <img
                  src={space.img}
                  alt={space.name}
                  className="h-40 w-full object-cover"
                />
                <div className="p-3">
                  <h4 className="font-semibold text-sm">{space.name}</h4>
                  <p className="text-xs text-gray-600">{space.location}</p>
                  <p className="text-xs mt-1">⭐ {space.rating}</p>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-semibold mb-3">Saved Hostels</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              {
                name: "The Lost Hostels",
                location: "Palolem, Goa",
                rating: 4.7,
                img: "/images/hostel1.jpg",
              },
              {
                name: "Happy Panda Hostel",
                location: "Arambol, Goa",
                rating: 4.8,
                img: "/images/hostel2.jpg",
              },
              {
                name: "Pappi Chulo",
                location: "Vagator, Goa",
                rating: 4.9,
                img: "/images/hostel3.jpg",
              },
              {
                name: "Dream Catcher Hostel",
                location: "Anjuna, Goa",
                rating: 4.7,
                img: "/images/hostel4.jpg",
              },
            ].map((hostel, idx) => (
              <div
                key={idx}
                className="rounded-lg overflow-hidden border hover:shadow-md transition">
                <img
                  src={hostel.img}
                  alt={hostel.name}
                  className="h-40 w-full object-cover"
                />
                <div className="p-3">
                  <h4 className="font-semibold text-sm">{hostel.name}</h4>
                  <p className="text-xs text-gray-600">{hostel.location}</p>
                  <p className="text-xs mt-1">⭐ {hostel.rating}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
