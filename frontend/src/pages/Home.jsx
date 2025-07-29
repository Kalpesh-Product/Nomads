import React from "react";
import { NavLink } from "react-router-dom";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import AccentButton from "../components/AccentButton";
import { Avatar, MenuItem, TextField } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { CiSearch } from "react-icons/ci";

const Home = () => {
  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      country: "",
      location: "",
      category: "",
    },
  });
  const { mutate: locationData, isPending: isLocation } = useMutation({
    mutationFn: async (data) => {
      console.log("data", data);
    },
    onSuccess: () => {
      console.log("success");
    },
    onError: () => {
      console.log("error");
    },
  });
  const avatarConfigs = [
    {
      alt: "Consultant 1",
      src: "",
      transform: "scale(1.1)",
    },
    {
      alt: "Consultant 2",
      src: "",
      transform: "scale(1.5) translate(0px, 10px)",
    },
    {
      alt: "Consultant 3",
      src: "",
      transform: "scale(1.1) translate(3px, 2px)",
    },
  ];
  return (
    <div>
      <section className="flex flex-col gap-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4 justify-end items-start">
            <p className="uppercase font-semibold text-title lg:text-[6rem] lg:leading-normal">
              WORLDS NOMAD COMMUNITY
            </p>
            <span className="text-[2rem]">
              Connecting Co-working Spaces and Flexible Workers
            </span>
          </div>
          <div className=" rounded-xl overflow-hidden">
            <div className="bg-[url('/images/bg-image.jpg')] bg-cover bg-center h-full w-full rounded-md shadow-md flex items-end">
              <div className="bg-white/10 backdrop-blur-md p-4 w-full flex flex-col gap-4">
                <span className="text-white">
                  Serves as a dynamic platform, seamlessly connecting freelance
                  professionals, remote workers, and individuals seeking
                  flexible workspace
                </span>
                <hr />
                <div className="flex items-center gap-2">
                  <div className="p-3 rounded-2xl bg-white">
                    <span>Ratings here</span>
                  </div>
                  <NavLink className={"text-white text-sm hover:underline"}>
                    View More Reviews
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-48">
            <div className="flex flex-col gap-4 h-full justify-between">
              <div className="bg-white text-black flex justify-center items-center">
                {" "}
                {/* Consultant Avatars */}
                <div className="flex justify-start items-center -space-x-4 w-full mt-4">
                  {avatarConfigs.map((config, index) => (
                    <Avatar
                      key={index}
                      alt={config.alt}
                      src={config.src}
                      sx={{
                        width: 103,
                        height: 103,
                        border: "2px solid white",
                        "& img": {
                          transform: config.transform,
                          transformOrigin: "center center",
                          objectFit: "contain",
                        },
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-start items-center">
                <SecondaryButton title={"BOOK YOUR SPACE NOW"} />
              </div>
            </div>
            <div className="flex flex-col gap-4 h-full justify-between">
              <div className="bg-white text-black border-l-2 border-black pl-4">
                <p className="text-content">
                  Serves as a dynamic platform, seamlessly connecting freelance
                  professionals, remote workers, and individuals seeking
                  flexible workspace solutions with nearby co-working spaces
                </p>
              </div>
              <div className="flex justify-center items-center">
                <AccentButton title={"LIST YOUR BUSINESS"} />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 justify-between">
            <form
              onSubmit={handleSubmit((data) => locationData(data))}
              className="flex gap-2 items-center border-2 border-primary-blue rounded-full pl-4 overflow-hidden"
            >
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    size="small"
                    variant="standard"
                    label="Select Country"
                    slotProps={{ input: { disableUnderline: true } }}
                  >
                    <MenuItem value="" disabled>
                      Select A Country
                    </MenuItem>
                    <MenuItem value="india">India</MenuItem>
                  </TextField>
                )}
              />
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    size="small"
                    variant="standard"
                    label="Select Country"
                    slotProps={{ input: { disableUnderline: true } }}
                  >
                    <MenuItem value="" disabled>
                      Select A Location
                    </MenuItem>
                    <MenuItem value="goa">Goa</MenuItem>
                  </TextField>
                )}
              />
              <div className="w-full border-l-2 border-l-primary-blue px-2 ">
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      size="small"
                      variant="standard"
                      label="Select Category"
                      slotProps={{ input: { disableUnderline: true } }}
                    >
                      <MenuItem value="" disabled>
                        Select A Category
                      </MenuItem>
                      <MenuItem value="coWorking">Co-Working</MenuItem>
                    </TextField>
                  )}
                />
              </div>
              <div className="bg-primary-blue h-full flex justify-center">
                <button
                  type="submit"
                  className="h-full text-center w-20 flex justify-center items-center"
                >
                  <CiSearch />
                </button>
              </div>
            </form>

            <div >
              <div className="grid grid-cols-3 text-center text-sm font-medium relative">
                {/* Top Row */}
                <div className="p-4">Co – Working</div>
                <div className="p-4 border-l border-r border-black">
                  Co – Living
                </div>
                <div className="p-4">Workation</div>

                {/* Horizontal Divider */}
                <div className="absolute left-0 right-0 border-t border-black top-1/2" />

                {/* Bottom Row */}
                <div className="p-4">Exclusive Campus</div>
                <div className="p-4 border-l border-r border-black">
                  Meeting Room
                </div>
                <div className="p-4">Conferences</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
