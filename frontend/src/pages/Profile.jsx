import React, { useState } from "react";
import { TextField, Button, Avatar, Tabs, Tab } from "@mui/material";
import { FaMapMarkerAlt } from "react-icons/fa";
import useAuth from "../hooks/useAuth";

const Profile = () => {
    const { auth } = useAuth();
const user = auth.user
console.log("userr",auth)
  const [activeTab, setActiveTab] = useState("profile");

  const handleTabChange = (tab) => setActiveTab(tab);

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
                A
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">John Doe</h3>
                <p className="text-sm">Founder & CEO</p>
                {/* <Button
                  variant="contained"
                  sx={{
                    mt: 1,
                    bgcolor: "#ff5757",
                    textTransform: "none",
                    "&:hover": { bgcolor: "#1a3b8a" },
                  }}>
                  Update Profile Image
                </Button> */}
              </div>
            </div>

            <div className="text-sm mt-4 md:mt-0">
              <p>
                <b>Email:</b> john@infuse.com
              </p>
              {/* <p>
                <b>Phone:</b> N/A
              </p>
              <p>
                <b>Work Location:</b> Panjim Goa, India
              </p>
              <span className="inline-block bg-green-600 text-white text-xs px-3 py-1 rounded-full mt-2">
                Active
              </span> */}
            </div>
          </div>

          {/* Personal Info */}
          <div className="mt-6 border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Personal Information</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <TextField label="First Name" size="small" />
              <TextField label="Middle Name" size="small" />
              <TextField label="Last Name" size="small" />
              <TextField label="Gender" size="small" />
              <TextField
                label="Date of Birth"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <TextField label="Mobile Phone" size="small" />
              <TextField label="Aadhar ID" size="small" />
              <TextField label="PAN" size="small" />
              <TextField label="Address Line 1" size="small" />
              <TextField label="Address Line 2" size="small" />
              <TextField label="State" size="small" />
              <TextField label="City" size="small" />
              <TextField label="Pin Code" size="small" />
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

          {/* Coworking Spaces */}
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

          {/* Hostels */}
          {/* <h3 className="text-lg font-semibold mb-3">Popular Hostels in Goa</h3> */}
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
