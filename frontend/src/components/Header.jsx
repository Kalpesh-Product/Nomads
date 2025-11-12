import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import PrimaryButton from "./PrimaryButton";
import logo from "../assets/WONO_LOGO_Black_TP.png";
import { useSelector } from "react-redux";
import {
  Drawer,
  Avatar,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { IoCloseSharp } from "react-icons/io5";
import Container from "./Container";
import { FaUserTie } from "react-icons/fa6";
import { FiLogOut } from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import useAuth from "../hooks/useAuth";
import useLogout from "../hooks/useLogout";

const Header = () => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null); // 🔹 for avatar dropdown
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get("view");
  const showToggle = location.pathname.includes("verticals");
  const { auth } = useAuth();
  const logout = useLogout();

  const formData = useSelector((state) => state.location.formValues);

  // 🔹 Avatar dropdown handlers
  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
  const handlePopoverClose = () => setAnchorEl(null);
  const openPopover = Boolean(anchorEl);

  const handleProfileClick = () => {
    navigate("/profile?tab=profile");
    handlePopoverClose();
  };
  const handleFavoriteClick = () => {
    // navigate("/favorites");
    navigate("/profile?tab=favorites");
    handlePopoverClose();
  };

  const handleSignOut = async () => {
    await logout();
    handlePopoverClose();
  };

  const handleNavigation = (path) => {
    navigate(path);
    setOpen(false);
  };

  const goToHosts = () => {
    if (window.location.hostname.includes("localhost")) {
      window.location.href = "http://hosts.localhost:5173";
    } else {
      window.location.href = "https://hosts.wono.co";
    }
  };
  const goToHostssMain = () => {
    if (window.location.hostname.includes("localhost")) {
      window.location.href = "http://localhost:5173";
    } else {
      window.location.href = "https://wono.co";
    }
  };

  const headerLinks = [
    { id: 1, text: "Home", to: "/" },
    { id: 2, text: "News", to: "/news" },
    { id: 3, text: "Blog", to: "/blog" },
  ];

  return (
    <div className="shadow-md bg-white/80 backdrop-blur-md">
      <Container padding={false}>
        <div className="flex py-3 justify-between items-center  lg:py-[0.625rem] ">
          {/* Logo */}
          <div className="flex items-center">
            <div
              onClick={goToHostssMain}
              className="w-24 h-10 lg:w-48 overflow-x-hidden rounded-lg flex gap-8 justify-start items-start cursor-pointer"
            >
              <img
                src={logo}
                alt="logo"
                className="w-fit h-full object-contain"
              />
            </div>

            <div className="min-w-[80px] hidden lg:block">
              {showToggle && (
                <ul>
                  {view !== "map" && (
                    <li className="flex items-center">
                      <div className="p-4 px-0 whitespace-nowrap">
                        <Link
                          to={`${location.pathname}?country=${formData?.country}&location=${formData?.location}&view=map`}
                          className="group relative text-md text-black"
                        >
                          <span className="relative z-10 group-hover:font-bold uppercase mb-2">
                            MAP VIEW
                          </span>
                          <span className="absolute left-0 bottom-0 top-6 w-0 h-[2px] bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                      </div>
                    </li>
                  )}

                  {view === "map" && (
                    <li className="flex items-center">
                      <div className="p-4 px-0 whitespace-nowrap">
                        <Link
                          to={`${location.pathname}?country=${formData?.country}&location=${formData?.location}`}
                          className="group relative text-md text-black"
                        >
                          <span className="relative z-10 group-hover:font-bold uppercase mb-2">
                            List view
                          </span>
                          <span className="absolute left-0 bottom-0 top-6 w-0 h-[2px] bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                      </div>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>

          {/* Main Nav */}
          <div className="w-full">
            <ul className="hidden xl:flex sm:hidden gap-8 justify-end flex-1">
              {headerLinks.map((item) => {
                const isActive =
                  item.to === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.to);

                return (
                  <li key={item.id} className="flex items-center">
                    <div className="p-4 px-0 whitespace-nowrap">
                      <Link
                        to={item.to}
                        className="group relative text-md text-black"
                      >
                        <span
                          className={`relative z-10 mb-8 uppercase ${
                            isActive ? "text-black" : "group-hover:font-bold"
                          }`}
                        >
                          {item.text}
                        </span>
                        <span
                          className={`absolute left-0 bottom-0 top-6 block h-[2px] bg-blue-500 transition-all duration-300 
                ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}
                        ></span>
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right Section */}
          <div className="hidden lg:flex pl-10 gap-10">
            <li className="flex items-center">
              <div className="p-4 px-0 whitespace-nowrap">
                <button
                  onClick={goToHosts}
                  className="relative pb-1 transition-all cursor-pointer duration-300 group font-bold bg-transparent uppercase border-none"
                >
                  Become a host
                  <span className="absolute left-0 w-0 bottom-0 block h-[2px] bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
                </button>
              </div>
            </li>

            <div className="px-1 hidden xl:flex xl:gap-4 py-2">
              {auth?.user ? (
                <>
                  <div className="flex justify-center items-center">
                    <AiFillHeart
                      className="text-[#ff5757] cursor-pointer"
                      size={28}
                      onClick={handleFavoriteClick}
                    />
                  </div>
                  <Avatar
                    onClick={handleAvatarClick} // 🔹 open dropdown
                    sx={{
                      bgcolor: "#ff5757",
                      cursor: "pointer",
                      width: 40,
                      height: 40,
                      fontSize: "1rem",
                    }}
                  >
                    {auth.user.firstName
                      ? auth.user.firstName.charAt(0).toUpperCase()
                      : "U"}
                  </Avatar>

                  {/* 🔹 Popover for Profile & Logout */}
                  <Popover
                    open={openPopover}
                    anchorEl={anchorEl}
                    onClose={handlePopoverClose}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "center",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "center",
                    }}
                  >
                    <div className="p-4 w-48">
                      <List>
                        <ListItem
                          button
                          onClick={handleProfileClick}
                          className="hover:text-red-600 transition-all duration-100 text-gray-500 cursor-pointer"
                        >
                          <ListItemIcon>
                            <FaUserTie className="text-gray-500" />
                          </ListItemIcon>
                          <ListItemText primary="Profile" />
                        </ListItem>

                        <Divider />

                        <ListItem
                          button
                          onClick={handleFavoriteClick}
                          className="hover:text-red-600 transition-all duration-100 text-gray-500 cursor-pointer"
                        >
                          <ListItemIcon>
                            <AiFillHeart className="text-gray-500" />
                          </ListItemIcon>
                          <ListItemText primary="Favorites" />
                        </ListItem>
                        <Divider />

                        <ListItem
                          button
                          onClick={handleSignOut}
                          className="hover:text-red-600 transition-all duration-100 text-gray-500 cursor-pointer"
                        >
                          <ListItemIcon>
                            <FiLogOut className="text-gray-500" />
                          </ListItemIcon>
                          <ListItemText primary="Log Out" />
                        </ListItem>
                      </List>
                    </div>
                  </Popover>
                </>
              ) : (
                <PrimaryButton
                  title="Login"
                  padding="py-1"
                  uppercase
                  handleSubmit={() => navigate("/login")}
                  className="bg-[#FF5757] flex text-white font-[500] capatilize hover:bg-[#E14C4C] w-[7rem] px-4"
                />
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="h-full px-2 lg:hidden">
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg text-subtitle text-black"
            >
              ☰
            </button>
          </div>

          {/* <Drawer
            sx={{
              "& .MuiDrawer-paper": {
                width: {
                  xs: "85%",
                  sm: "400px",
                },
              },
            }}
            anchor="left"
            open={open}
            onClose={() => setOpen(false)}
          ></Drawer> */}
          <Drawer
            sx={{
              "& .MuiDrawer-paper": {
                width: {
                  xs: "85%",
                  sm: "400px",
                },
              },
            }}
            anchor="left"
            open={open}
            onClose={() => setOpen(false)}
          >
            <div className="flex flex-col h-full justify-between">
              <ul className="flex flex-col gap-2 p-4 ">
                <div className="flex justify-end w-full">
                  <span
                    className="text-title cursor-pointer text-black"
                    onClick={() => setOpen(false)}
                  >
                    <IoCloseSharp />
                  </span>
                </div>

                {headerLinks.map((item) => (
                  <li key={item.id} className="items-center text-center">
                    <div
                      onClick={() => handleNavigation(item.to)}
                      className="py-4 cursor-pointer"
                    >
                      <p className="text-secondary-dark text-lg">{item.text}</p>
                    </div>
                    <div className="h-[0.2px] bg-gray-300"></div>
                  </li>
                ))}

                {auth?.user ? (
                  <>
                    <li className="items-center text-center">
                      <div
                        onClick={() => {
                          handleNavigation("/profile?tab=profile");
                        }}
                        className="py-4 cursor-pointer"
                      >
                        <p className="text-secondary-dark text-lg">Profile</p>
                      </div>
                      <div className="h-[0.2px] bg-gray-300"></div>
                    </li>
                    <li className="items-center text-center">
                      <div
                        onClick={() => {
                          handleNavigation("/profile?tab=favorites");
                        }}
                        className="py-4 cursor-pointer"
                      >
                        <p className="text-secondary-dark text-lg">Favorites</p>
                      </div>
                      <div className="h-[0.2px] bg-gray-300"></div>
                    </li>

                    <li className="items-center text-center">
                      <div
                        onClick={async () => {
                          await handleSignOut();
                          setOpen(false);
                        }}
                        className="py-4 cursor-pointer"
                      >
                        <p className="text-secondary-dark text-lg">Log Out</p>
                      </div>
                      {/* <div className="h-[0.2px] bg-gray-300"></div> */}
                    </li>
                  </>
                ) : (
                  <div className="flex justify-center py-4">
                    <PrimaryButton
                      title="Login"
                      padding="py-3"
                      uppercase
                      handleSubmit={() => {
                        navigate("/login");
                        setOpen(false);
                      }}
                      // className="bg-[#FF5757] flex text-white font-[500] capitalize hover:bg-[#E14C4C] w-[7rem] px-4"
                      className="bg-[#FF5757] flex text-white font-[500] capitalize hover:bg-[#E14C4C] w-full sm:w-[7rem]"
                    />
                  </div>
                )}
              </ul>

              {/* Drawer Footer */}
              <div className="w-full text-center flex flex-col gap-4 items-center py-4">
                <div className="flex w-full flex-col gap-2 text-small md:text-small">
                  <hr />
                  <span>
                    &copy; Copyright {new Date().getFullYear()} -{" "}
                    {(new Date().getFullYear() + 1).toString().slice(-2)}
                  </span>
                  <span>WoNo. All rights reserved</span>
                </div>
              </div>
            </div>
          </Drawer>
        </div>
      </Container>
    </div>
  );
};

export default Header;
